import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-token-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './token-bar.component.html',
  styleUrls: ['./token-bar.component.css']
})
export class TokenBarComponent {
  @Input() accessToken: string | null = null;
  showToken = false;
}
