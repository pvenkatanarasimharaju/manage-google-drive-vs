import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriveService, UploadProgress } from '../../services/drive.service';
import { formatFileSize } from '../../utils/format';

@Component({
  selector: 'app-upload-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-card.component.html',
  styleUrls: ['./upload-card.component.css']
})
export class UploadCardComponent {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  @Output() uploaded = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragOver = false;

  constructor(private drive: DriveService) {}

  formatSize(bytes: string | undefined): string {
    return formatFileSize(bytes);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  upload(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.drive.uploadFile(this.selectedFile).subscribe({
      next: (progress: UploadProgress) => {
        this.uploadProgress = progress.percent;
        if (progress.done) {
          this.isUploading = false;
          const name = progress.response?.name || this.selectedFile?.name || 'File';
          this.selectedFile = null;
          this.uploadProgress = 0;
          this.resetFileInput();
          this.uploaded.emit(name);
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        this.uploadError.emit(err?.error?.error?.message || 'Upload failed. Please try again.');
      }
    });
  }

  /** Clears the native file input so the browser no longer shows the previous filename. */
  private resetFileInput(): void {
    const el = this.fileInput?.nativeElement;
    if (el) {
      el.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.selectedFile = files[0];
      this.upload();
    }
  }
}
