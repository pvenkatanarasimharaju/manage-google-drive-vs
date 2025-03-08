import { Component, OnInit } from '@angular/core';

import { GoogleAuthService } from './google-auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
    accessToken: string | null = null;
    files: any[] = [];
    selectedFile: File | null = null;
    uploadResponse: any = null;
    isRequestInProgress = false;

    constructor(private authService: GoogleAuthService) { }

    ngOnInit() {
        this.accessToken = this.authService.getAccessTokenFromUrl();
        if (this.accessToken) {
            this.getFiles();
        }
    }

    getFiles() {
        if (this.accessToken) {
            this.authService.getDriveFiles(this.accessToken).subscribe((response: any) => {
                this.files = response.files;
            });
        }
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    uploadFile() {
        if (this.selectedFile && this.accessToken) {
            this.isRequestInProgress = true;
            this.authService.uploadFile(this.accessToken, this.selectedFile).subscribe(response => {
                this.uploadResponse = response;
                console.log('File uploaded:', response);
                this.getFiles();
                this.isRequestInProgress = false;
            }, error => {
                console.error('Upload error:', error);
            });
        }
    }

    deleteFile(fileId: string) {
        if (this.accessToken) {
            this.isRequestInProgress = true;
            this.authService.deleteFile(this.accessToken, fileId).subscribe(() => {
                console.log('File deleted:', fileId);
                this.files = this.files.filter(file => file.id !== fileId);
                this.isRequestInProgress = false;
            }, (error: any) => {
                console.error('Error deleting file:', error);
            });
        }
    }

    login() {
        this.authService.loginWithGoogle();
    }

    logout() {
        if (this.accessToken) {
            this.authService.revokeAccessToken(this.accessToken).subscribe(() => {
                this.accessToken = null;
                this.files = [];
                window.location.hash = '';
                console.log('Access token revoked');
                localStorage.removeItem('access_token');
            });
        }
    }
}
