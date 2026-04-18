import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriveFile } from '../../models/drive-file';
import { formatFileSize, formatFileDate } from '../../utils/format';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent {
  @Input() files: DriveFile[] = [];
  @Input() isLoading = false;
  @Output() refresh = new EventEmitter<void>();
  @Output() preview = new EventEmitter<DriveFile>();
  @Output() download = new EventEmitter<DriveFile>();
  @Output() delete = new EventEmitter<DriveFile>();

  searchQuery = '';

  get filteredFiles(): DriveFile[] {
    if (!this.searchQuery.trim()) return this.files;
    const q = this.searchQuery.toLowerCase();
    return this.files.filter(f => f.name.toLowerCase().includes(q));
  }

  formatSize(bytes: string | undefined): string {
    return formatFileSize(bytes);
  }

  formatDate(iso: string | undefined): string {
    return formatFileDate(iso);
  }
}
