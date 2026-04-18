import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError, switchMap, catchError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isGoogleApi = req.url.includes('googleapis.com');
    const isTokenEndpoint = req.url.startsWith(TOKEN_URL);

    if (!isGoogleApi || isTokenEndpoint) {
      return next.handle(req);
    }

    if (this.auth.isTokenExpired() && this.auth.hasRefreshToken()) {
      return from(this.auth.refreshAccessToken()).pipe(
        switchMap(() => next.handle(this.addToken(req))),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) this.auth.clearTokens();
          return throwError(() => err);
        })
      );
    }

    return next.handle(this.addToken(req)).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && isGoogleApi) {
          this.auth.clearTokens();
        }
        return throwError(() => err);
      })
    );
  }

  private addToken(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = this.auth.getToken();
    if (!token) return req;
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
