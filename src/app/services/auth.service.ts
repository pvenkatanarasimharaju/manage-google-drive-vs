import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environment/environment';
import { TokenResponse } from '../models/token-response.model';

const ACCESS_TOKEN_KEY = 'drive_access_token';
const REFRESH_TOKEN_KEY = 'drive_refresh_token';
const EXPIRY_KEY = 'drive_token_expiry';
const PKCE_VERIFIER_KEY = 'drive_pkce_verifier';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private clientId = environment.clientId;
  private clientSecret = environment.clientSecret;
  private scope = 'https://www.googleapis.com/auth/drive.file';

  private refreshInFlight: Promise<string | null> | null = null;

  constructor(private http: HttpClient) {}

  private get redirectUri(): string {
    return window.location.origin + window.location.pathname;
  }

  // ── PKCE helpers ──────────────────────────────────────────────

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // ── Login (authorization code + PKCE) ─────────────────────────

  async loginWithGoogle(): Promise<void> {
    const verifier = this.generateCodeVerifier();
    const challenge = await this.generateCodeChallenge(verifier);
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scope,
      access_type: 'offline',
      prompt: 'consent',
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `${AUTH_URL}?${params.toString()}`;
  }

  // ── Handle callback (exchange code → tokens) ─────────────────

  async handleAuthCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) return false;

    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY) || '';
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);

    // Clean the URL so the code isn't visible / reused
    window.history.replaceState({}, document.title, this.redirectUri);

    try {
      const tokens = await this.exchangeCodeForTokens(code, verifier);
      this.storeTokens(tokens);
      return true;
    } catch {
      return false;
    }
  }

  private exchangeCodeForTokens(code: string, verifier: string): Promise<TokenResponse> {
    const body = new HttpParams()
      .set('code', code)
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('redirect_uri', this.redirectUri)
      .set('grant_type', 'authorization_code')
      .set('code_verifier', verifier);

    return new Promise((resolve, reject) => {
      this.http.post<TokenResponse>(TOKEN_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).subscribe({ next: resolve, error: reject });
    });
  }

  // ── Token storage (localStorage for persistence) ──────────────

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    const expiryMs = Date.now() + tokens.expires_in * 1000;
    localStorage.setItem(EXPIRY_KEY, expiryMs.toString());
  }

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10) - 60_000; // refresh 1 min early
  }

  hasValidSession(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  // ── Silent refresh ────────────────────────────────────────────

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshInFlight) return this.refreshInFlight;

    this.refreshInFlight = this._doRefresh();
    try {
      return await this.refreshInFlight;
    } finally {
      this.refreshInFlight = null;
    }
  }

  private _doRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return Promise.resolve(null);

    const body = new HttpParams()
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('refresh_token', refreshToken)
      .set('grant_type', 'refresh_token');

    return new Promise(resolve => {
      this.http.post<TokenResponse>(TOKEN_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).subscribe({
        next: (tokens) => {
          this.storeTokens(tokens);
          resolve(tokens.access_token);
        },
        error: () => {
          this.clearTokens();
          resolve(null);
        }
      });
    });
  }

  // ── Logout ────────────────────────────────────────────────────

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  }

  revokeAccessToken(accessToken: string): Observable<unknown> {
    const params = new HttpParams().set('token', accessToken);
    return this.http.post(REVOKE_URL, null, { params });
  }
}
