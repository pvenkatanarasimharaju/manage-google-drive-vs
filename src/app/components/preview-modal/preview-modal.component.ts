import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriveFile } from '../../models/drive-file';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-preview-modal',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.css']
})
export class PreviewModalComponent {
  @Input() file: DriveFile | null = null;
  @Output() closed = new EventEmitter<void>();

  get previewUrl(): string {
    if (!this.file) return '';
    return `https://drive.google.com/file/d/${this.file.id}/preview`;
  }
}
