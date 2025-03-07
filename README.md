# Google Drive Integration with Angular

This Angular project integrates Google Drive API for **authentication, file upload, listing, deletion, and access revocation** using OAuth 2.0.

## 🚀 Features
- Google OAuth 2.0 Authentication
- Upload Files to Google Drive
- List Files from Google Drive
- Delete Files from Google Drive
- Revoke Google Access Token

## 📌 Prerequisites
1. **Login to Google cloud console** in [Google Cloud Console](https://console.cloud.google.com/)
	- Create a new project
2. **Enable Google Drive API** in [Google Cloud Console](https://console.cloud.google.com/)
	- Click on the nav and select APIs and services
	- Click on Enable APIs and services and search for google drive api and enable it

3. **Create API** in [Google Cloud Console](https://console.cloud.google.com/)
	- Click on credentials and create an API
	
4. **Create OAuth 2.0 Credentials** → Web Application
   - **Authorized Redirect URI:** `http://localhost:4200/auth-callback`
   - Save **Client ID & Secret**
5. **Install Angular & Dependencies**
   ```bash
   npm install -g @angular/cli
   git clone <your-repo-url>
   cd google-drive-angular
   npm install
   ```

## 🔐 Authentication Setup
Extract OAuth **access token** in Angular:
```typescript
getAccessTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.hash.substring(1));
  return params.get('access_token');
}
```

## 📂 File Operations

### **Upload File**
```typescript
uploadFile(accessToken: string, file: File) {
  const metadata = { name: file.name, mimeType: file.type };
  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  return this.http.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData, { headers });
}
```

### **List Files**
```typescript
getDriveFiles(accessToken: string) {
  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  return this.http.get('https://www.googleapis.com/drive/v3/files', { headers });
}
```

### **Delete File**
```typescript
deleteFile(accessToken: string, fileId: string) {
  const headers = new HttpHeaders({ Authorization: `Bearer ${accessToken}` });
  return this.http.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, { headers });
}
```

### **Revoke Access Token**
```typescript
revokeAccessToken(accessToken: string) {
  const params = new HttpParams().set('token', accessToken);
  return this.http.post('https://accounts.google.com/o/oauth2/revoke', null, { params });
}
```

## 🚀 Run the Application
```bash
ng serve
```
Open: `http://localhost:4200/`

## 🎯 Summary
✅ Google OAuth 2.0 Authentication  
✅ Upload, List, and Delete Files  
✅ Revoke Access Token  

Let me know if you have any issues! 🚀

