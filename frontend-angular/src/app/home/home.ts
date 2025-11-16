import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LogoutUseCase} from '../core/domain/use-cases/logout.use-case';
import {LoginUseCase} from '../core/domain/use-cases/login.use-case';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <nav class="navbar">
        <h1>PAP Battle Tracker</h1>
        <div class="user-info">
          @if (loginUserCase.currentUser(); as user) {
            <span>Welcome, {{ user.userName }}!</span>
            <button (click)="logout()" class="btn-logout">Logout</button>
          }
        </div>
      </nav>

      <main class="content">
        <h2>Dashboard</h2>
        <p>This is a protected page. RegisterRequestOnly authenticated users can see this.</p>

        @if (loginUserCase.currentUser(); as user) {
          <div class="user-card">
            <h3>Your Profile</h3>
            <p><strong>Username:</strong> {{ user.userName }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .navbar {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar h1 {
      margin: 0;
      color: #667eea;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-logout {
      padding: 0.5rem 1rem;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: #d32f2f;
    }

    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class HomeComponent {
  constructor(
    public logoutUseCase: LogoutUseCase,
    public loginUserCase: LoginUseCase,
  ) {
  }

  logout(): void {
    this.logoutUseCase.execute();
  }
}
