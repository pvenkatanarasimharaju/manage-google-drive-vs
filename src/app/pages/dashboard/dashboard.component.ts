import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DriveService } from '../../services/drive.service';
import { DriveFile } from '../../models/drive-file';

import { TokenBarComponent } from '../../components/token-bar/token-bar.component';
import { UploadCardComponent } from '../../components/upload-card/upload-card.component';
import { FileListComponent } from '../../components/file-list/file-list.component';
import { DeleteModalComponent } from '../../components/delete-modal/delete-modal.component';
import { PreviewModalComponent } from '../../components/preview-modal/preview-modal.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    TokenBarComponent,
    UploadCardComponent,
    FileListComponent,
    DeleteModalComponent,
    PreviewModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  files: DriveFile[] = [];
  isLoading = false;
  fileToDelete: DriveFile | null = null;
  fileToPreview: DriveFile | null = null;

  successMessage = '';
  errorMessage = '';

  constructor(
    public auth: AuthService,
    private drive: DriveService
  ) {}

  get accessToken(): string | null {
    return this.auth.getToken();
  }

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoading = true;
    this.drive.getFiles().subscribe({
      next: (res) => {
        this.files = res.files || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err?.error?.error?.message || 'Failed to load files.');
      }
    });
  }

  onFileUploaded(fileName: string): void {
    this.showSuccess(`File "${fileName}" uploaded successfully.`);
    this.loadFiles();
  }

  onUploadError(message: string): void {
    this.showError(message);
  }

  onPreview(file: DriveFile): void {
    this.fileToPreview = file;
  }

  closePreview(): void {
    this.fileToPreview = null;
  }

  onDownload(file: DriveFile): void {
    this.isLoading = true;
    this.drive.downloadFile(file.id).subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err?.error?.error?.message || 'Download failed.');
      }
    });
  }

  onDelete(file: DriveFile): void {
    this.fileToDelete = file;
  }

  cancelDelete(): void {
    this.fileToDelete = null;
  }

  confirmDelete(): void {
    if (!this.fileToDelete) return;
    const file = this.fileToDelete;
    this.fileToDelete = null;
    this.isLoading = true;

    this.drive.deleteFile(file.id).subscribe({
      next: () => {
        this.files = this.files.filter(f => f.id !== file.id);
        this.isLoading = false;
        this.showSuccess(`"${file.name}" deleted.`);
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err?.error?.error?.message || 'Failed to delete file.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => { this.successMessage = ''; }, 4000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => { this.errorMessage = ''; }, 6000);
  }
}
