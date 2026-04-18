import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, LoginComponent, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(public auth: AuthService) {}

  get isLoggedIn(): boolean {
    return !!this.auth.getToken() || this.auth.hasRefreshToken();
  }

  async ngOnInit(): Promise<void> {
    await this.auth.handleAuthCallback();

    if (this.auth.isTokenExpired() && this.auth.hasRefreshToken()) {
      await this.auth.refreshAccessToken();
    }
  }

  logout(): void {
    const token = this.auth.getToken();
    if (token) {
      this.auth.revokeAccessToken(token).subscribe({
        next: () => this.auth.clearTokens(),
        error: () => this.auth.clearTokens()
      });
    } else {
      this.auth.clearTokens();
    }
  }
}
