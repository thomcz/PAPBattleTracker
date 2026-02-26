import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SessionDetailUseCase} from '../../../../core/domain/use-cases/session-detail.use-case';
import {LoginUseCase} from '../../../../core/domain/use-cases/login.use-case';
import {LogoutUseCase} from '../../../../core/domain/use-cases/logout.use-case';
import {CreateBattleDialogComponent} from '../../../battle/components/create-battle-dialog/create-battle-dialog.component';
import {SessionStatusBadgeComponent} from '../../components/session-status-badge/session-status-badge.component';
import {BattleSummary, CombatStatus} from '../../../../core/domain/models/battle.model';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CreateBattleDialogComponent, SessionStatusBadgeComponent],
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss']
})
export class SessionDetailComponent implements OnInit {
  showCreateBattleDialog = signal<boolean>(false);
  showRenameDialog = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  lifecycleError = signal<string | null>(null);
  renameError = signal<string | null>(null);
  pendingRename = signal<string>('');
  sessionId = '';

  constructor(
    public sessionDetailUseCase: SessionDetailUseCase,
    private route: ActivatedRoute,
    private router: Router,
    public loginUseCase: LoginUseCase,
    public logoutUseCase: LogoutUseCase
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.sessionId) {
      this.sessionDetailUseCase.loadSession(this.sessionId);
    } else {
      this.router.navigate(['/home']);
    }
  }

  openCreateBattleDialog(): void {
    this.showCreateBattleDialog.set(true);
  }

  closeCreateBattleDialog(): void {
    this.showCreateBattleDialog.set(false);
  }

  onBattleCreated(battle: BattleSummary): void {
    // Reload session to get updated battle list
    this.sessionDetailUseCase.loadSession(this.sessionId);
    this.closeCreateBattleDialog();
  }

  viewBattle(battleId: string): void {
    this.router.navigate(['/battles', battleId]);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.logoutUseCase.execute();
  }

  openRenameDialog(): void {
    this.pendingRename.set(this.sessionDetailUseCase.session()?.name ?? '');
    this.showRenameDialog.set(true);
  }

  closeRenameDialog(): void {
    this.showRenameDialog.set(false);
    this.renameError.set(null);
  }

  submitRename(): void {
    const name = this.pendingRename().trim();
    if (!name) return;
    this.renameError.set(null);
    this.sessionDetailUseCase.renameSession(this.sessionId, name).subscribe({
      next: () => this.closeRenameDialog(),
      error: () => this.renameError.set('Failed to rename session.')
    });
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
  }

  confirmDelete(): void {
    this.sessionDetailUseCase.deleteSession(this.sessionId).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => this.closeDeleteConfirm()
    });
  }

  startSession(): void {
    this.lifecycleError.set(null);
    this.sessionDetailUseCase.startSession(this.sessionId).subscribe({
      error: () => this.lifecycleError.set('Failed to start session.')
    });
  }

  finishSession(): void {
    this.lifecycleError.set(null);
    this.sessionDetailUseCase.finishSession(this.sessionId).subscribe({
      error: () => this.lifecycleError.set('Failed to finish session.')
    });
  }

  getUserInitial(): string {
    const user = this.loginUseCase.currentUser();
    return user?.userName?.charAt(0)?.toUpperCase() ?? '?';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case CombatStatus.NOT_STARTED: return 'Not Started';
      case CombatStatus.ACTIVE: return 'Active';
      case CombatStatus.PAUSED: return 'Paused';
      case CombatStatus.ENDED: return 'Ended';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case CombatStatus.NOT_STARTED: return 'status-not-started';
      case CombatStatus.ACTIVE: return 'status-active';
      case CombatStatus.PAUSED: return 'status-paused';
      case CombatStatus.ENDED: return 'status-ended';
      default: return '';
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
