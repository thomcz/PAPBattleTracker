import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {LogoutUseCase} from '../core/domain/use-cases/logout.use-case';
import {LoginUseCase} from '../core/domain/use-cases/login.use-case';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
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
        <p>Welcome to PAP Battle Tracker! Manage your tabletop RPG combat sessions.</p>

        <div class="quick-actions">
          <div class="action-card" (click)="goToBattles()">
            <div class="action-icon">⚔️</div>
            <h3>Battle Sessions</h3>
            <p>Create and manage your combat encounters</p>
            <button class="btn-action">Go to Battles</button>
          </div>

          <div class="action-card" (click)="goToPlayers()">
            <div class="action-icon">🛡️</div>
            <h3>My Players</h3>
            <p>Create and manage your reusable player characters</p>
            <button class="btn-action">Go to Players</button>
          </div>

          <div class="action-card" (click)="goToBeastery()">
            <div class="action-icon">🐉</div>
            <h3>My Beastery</h3>
            <p>Create reusable creature templates for your battles</p>
            <button class="btn-action">Go to Beastery</button>
          </div>

          @if (loginUserCase.currentUser(); as user) {
            <div class="action-card">
              <div class="action-icon">👤</div>
              <h3>Your Profile</h3>
              <p><strong>Username:</strong> {{ user.userName }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
            </div>
          }
        </div>
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

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .action-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .action-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .action-card p {
      color: #6c757d;
      margin: 0.5rem 0;
    }

    .btn-action {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
      width: 100%;
    }

    .btn-action:hover {
      background: #5568d3;
    }
  `]
})
export class HomeComponent {
  constructor(
    public logoutUseCase: LogoutUseCase,
    public loginUserCase: LoginUseCase,
    private router: Router
  ) {
  }

  logout(): void {
    this.logoutUseCase.execute();
  }

  goToBattles(): void {
    this.router.navigate(['/battles']);
  }

  goToPlayers(): void {
    this.router.navigate(['/players']);
  }

  goToBeastery(): void {
    this.router.navigate(['/beastery']);
  }
}
