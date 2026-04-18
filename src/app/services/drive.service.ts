import { HttpClient, HttpRequest, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, filter } from 'rxjs';

import { DriveFileListResponse, DriveUploadResponse } from '../models/drive-file';

const API_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const FILE_FIELDS = 'files(id,name,mimeType,size,modifiedTime,iconLink,thumbnailLink,webViewLink)';

export interface UploadProgress {
  percent: number;
  done: boolean;
  response?: DriveUploadResponse;
}

@Injectable({ providedIn: 'root' })
export class DriveService {
  constructor(private http: HttpClient) {}

  getFiles(): Observable<DriveFileListResponse> {
    return this.http.get<DriveFileListResponse>(API_URL, {
      params: { fields: FILE_FIELDS, pageSize: '100' }
    });
  }

  uploadFile(file: File): Observable<UploadProgress> {
    const metadata = { name: file.name, mimeType: file.type };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const req = new HttpRequest('POST', UPLOAD_URL, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      filter((event: HttpEvent<unknown>) =>
        event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response
      ),
      map((event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          return { percent, done: false };
        }
        const res = event as HttpResponse<DriveUploadResponse>;
        return { percent: 100, done: true, response: res.body ?? undefined };
      })
    );
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${fileId}`);
  }

  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${API_URL}/${fileId}?alt=media`, { responseType: 'blob' });
  }
}
