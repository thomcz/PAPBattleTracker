import {Component, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {SessionListUseCase} from '../../../../core/domain/use-cases/session-list.use-case';
import {SessionStatus, SessionSummary} from '../../../../core/domain/models/session.model';
import {CreateSessionDialogComponent} from '../../components/create-session-dialog/create-session-dialog.component';
import {SessionStatusBadgeComponent} from '../../components/session-status-badge/session-status-badge.component';
import {LoginUseCase} from '../../../../core/domain/use-cases/login.use-case';
import {LogoutUseCase} from '../../../../core/domain/use-cases/logout.use-case';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CreateSessionDialogComponent, SessionStatusBadgeComponent],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {
  showCreateDialog = signal<boolean>(false);

  constructor(
    public sessionListUseCase: SessionListUseCase,
    private router: Router,
    public loginUseCase: LoginUseCase,
    public logoutUseCase: LogoutUseCase
  ) {}

  ngOnInit(): void {
    this.sessionListUseCase.loadSessions();
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  onSessionCreated(): void {
    this.closeCreateDialog();
  }

  viewSession(sessionId: string): void {
    this.router.navigate(['/sessions', sessionId]);
  }

  logout(): void {
    this.logoutUseCase.execute();
  }

  getUserInitial(): string {
    const user = this.loginUseCase.currentUser();
    return user?.userName?.charAt(0)?.toUpperCase() ?? '?';
  }

  getStatusClass(status: SessionStatus): string {
    switch (status) {
      case SessionStatus.PLANNED: return 'status-planned';
      case SessionStatus.STARTED: return 'status-started';
      case SessionStatus.FINISHED: return 'status-finished';
      default: return '';
    }
  }

  getStatusLabel(status: SessionStatus): string {
    switch (status) {
      case SessionStatus.PLANNED: return 'Planned';
      case SessionStatus.STARTED: return 'Started';
      case SessionStatus.FINISHED: return 'Finished';
      default: return status;
    }
  }

  getRelativeTime(dateString: string): string {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    const diffMonth = Math.floor(diffDay / 30);
    return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  }
}
