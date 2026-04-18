# Google Drive Integration with Angular

This Angular project integrates Google Drive API for **authentication, file upload, listing, deletion, and access revocation** using OAuth 2.0.

## 🚀 Features
- Google OAuth 2.0 Authentication
- Upload Files to Google Drive
- List Files from Google Drive
- Delete Files from Google Drive
- Revoke Google Access Token

## 📌 Prerequisites

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown (top-left) → **New Project**
3. Give it a name (e.g. "Drive Manager") and click **Create**
4. Make sure the new project is selected in the dropdown

### 2. Enable Google Drive API

The Drive API must be enabled for your Google Cloud project. If it is not, API calls fail with errors such as `SERVICE_DISABLED` or *"Google Drive API has not been used in project … before or it is disabled"*.

1. **Select your project** — At the top of [Google Cloud Console](https://console.cloud.google.com/), open the **project dropdown** and select the project you use for this app (the same project where your OAuth client lives).  
2. **Open the Library** — In the left menu, go to **APIs & Services → Library**.
3. **Search for the API** — In the search bar, type **Google Drive API** and select it from the results.
4. **Enable the API** — On the Google Drive API page, click **Enable**.
5. **Propagation** — If you enabled the API just now, wait a few minutes before retrying the app so the change can propagate.

### 3. Configure OAuth Consent Screen
1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** and click **Create**
3. Fill in the required fields (App name, User support email, Developer email)
4. Click **Save and Continue** through the remaining steps
5. Under **Test users**, add your Google account email so you can log in during development

### 4. Create OAuth 2.0 Client ID
1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: anything (e.g. "Drive Manager Web")
5. Under **Authorized redirect URIs**, add every URL where the app will run:

   | Environment | Redirect URI |
   |---|---|
   | Local dev | `http://localhost:4200/` |
   | GitHub Pages | `https://<username>.github.io/<repo-name>/` |

   > The app uses `window.location.origin + window.location.pathname` as the redirect URI, so it must match exactly (including the trailing `/`).

6. Click **Create**
7. Copy the **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`) and the **Client secret** (used by this app for the authorization-code flow and refresh tokens).

### 5. Install Angular & Dependencies
```bash
npm install -g @angular/cli
git clone https://github.com/pvenkatanarasimharaju/manage-google-drive-vs.git
cd manage-google-drive-vs
npm install
```

### 6. Configure environment
Create `src/environment/environment.ts` (keep this file out of version control if it contains secrets) and set your **Client ID** and **Client secret**:

```typescript
export const environment = {
  production: false,
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  clientSecret: 'YOUR_CLIENT_SECRET'
};
```

> **Security:** A client secret in a browser-built app can be extracted by anyone. Use it only for personal or local development, or replace this with a small backend that exchanges the auth code for tokens.

## 🔐 Authentication setup

The app uses the **OAuth 2.0 authorization code flow with PKCE**, `access_type=offline`, and a **refresh token** stored in `localStorage`. After the first consent, access tokens are renewed without sending you through the full Google sign-in screen each hour. The redirect returns a `code` query parameter, which the app exchanges for tokens at `https://oauth2.googleapis.com/token`.

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

### **Revoke access token**
```typescript
revokeAccessToken(accessToken: string) {
  const params = new HttpParams().set('token', accessToken);
  return this.http.post('https://oauth2.googleapis.com/revoke', null, { params });
}
```

## 🚀 Run the Application
```bash
ng serve
```
Open: `http://localhost:4200/`

## To Deploy the Application (GitHub Pages)

The project is already set up to publish from the `docs/` folder:

- **`angular.json`** — `build.options.outputPath` is `docs`. The **production** configuration sets `baseHref` to `/manage-google-drive-vs/` (your repo name on GitHub Pages).
- **`src/index.html`** — uses `<base href="/">` so `ng serve` works locally. Production builds rewrite the base href via Angular CLI, so you do not edit `index.html` by hand for each deploy.

Build the static site and commit the `docs/` output:

```bash
npm run build:gh-pages
```

That runs `ng build --configuration production --output-path=docs --base-href=/manage-google-drive-vs/`. Then push the updated `docs/` folder to `master` (or your default branch).

In the GitHub repo: **Settings → Pages → Build and deployment → Source**: deploy from the **`/docs`** folder on your branch.

If you rename the repository, update **`baseHref`** in `angular.json` (production), the **`build:gh-pages`** script in `package.json`, and your **Google OAuth authorized redirect URIs** so they match the new Pages URL.

## 🎯 Summary
✅ Enable **Google Drive API** on your Cloud project (see [step 2](#2-enable-google-drive-api))  
✅ Google OAuth 2.0 (authorization code + PKCE, refresh tokens)  
✅ Upload, list, and delete files  
✅ Revoke access on logout  

Let me know if you have any issues! 🚀

