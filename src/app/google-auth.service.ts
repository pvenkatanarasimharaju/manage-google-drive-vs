import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../environment/environment';

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthService {
    private clientId = environment.clientId;
    private redirectUri = 'https://pvenkatanarasimharaju.github.io/manage-google-drive-vs';
    private scope = 'https://www.googleapis.com/auth/drive';
    private driveApiUrl = 'https://www.googleapis.com/drive/v3/files';
    private uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    private revokeUrl = 'https://accounts.google.com/o/oauth2/revoke';

    constructor(private http: HttpClient) { }

    loginWithGoogle() {
        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=token&scope=${this.scope}`;
        window.location.href = authUrl;
    }

    revokeAccessToken(accessToken: string) {
        const params = new HttpParams().set('token', accessToken);
        return this.http.post(this.revokeUrl, null, { params });
    }

    getAccessTokenFromUrl(): string | null {
        const fragment = new URLSearchParams(window.location.hash.substring(1));
        return fragment.get('access_token');
    }

    getDriveFiles(accessToken: string) {
        const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
        return this.http.get(this.driveApiUrl, { headers });
    }

    uploadFile(accessToken: string, file: File) {
        const metadata = {
            name: file.name,
            mimeType: file.type
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', file);

        const headers = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`
        });

        return this.http.post(this.uploadUrl, formData, { headers });
    }

    deleteFile(accessToken: string, fileId: string) {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`
        });

        return this.http.delete(`${this.driveApiUrl}/${fileId}`, { headers });
    }

    downloadFile(accessToken: string, fileId: string) {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`
        });

        return this.http.get(`${this.driveApiUrl}/${fileId}?alt=media`, { headers, responseType: 'blob' });
    }
}
