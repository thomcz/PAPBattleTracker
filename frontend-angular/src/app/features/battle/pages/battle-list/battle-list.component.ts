import {Component, computed, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {BattleApiAdapter} from '../../../../adapters/api/battle-api.adapter';
import {BattleSummary, CombatStatus} from '../../../../core/domain/models/battle.model';
import {CreateBattleDialogComponent} from '../../components/create-battle-dialog/create-battle-dialog.component';
import {LoginUseCase} from '../../../../core/domain/use-cases/login.use-case';
import {LogoutUseCase} from '../../../../core/domain/use-cases/logout.use-case';

@Component({
  selector: 'app-battle-list',
  standalone: true,
  imports: [CreateBattleDialogComponent],
  templateUrl: './battle-list.component.html',
  styleUrls: ['./battle-list.component.scss']
})
export class BattleListComponent implements OnInit {
  battles = signal<BattleSummary[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showCreateDialog = signal<boolean>(false);

  readonly battleCount = computed(() =>
    this.battles().filter(b => b.status !== CombatStatus.ENDED).length
  );

  constructor(
    private battleApi: BattleApiAdapter,
    private router: Router,
    public loginUseCase: LoginUseCase,
    public logoutUseCase: LogoutUseCase
  ) {}

  ngOnInit(): void {
    this.loadBattles();
  }

  loadBattles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.battleApi.listBattles().subscribe({
      next: (battles) => {
        this.battles.set(battles);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load battles. Please try again.');
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  onBattleCreated(battle: BattleSummary): void {
    this.battles.update(battles => [...battles, battle]);
    this.closeCreateDialog();
    this.router.navigate(['/battles', battle.id]);
  }

  viewBattle(battleId: string): void {
    this.router.navigate(['/battles', battleId]);
  }

  logout(): void {
    this.logoutUseCase.execute();
  }

  getUserInitial(): string {
    const user = this.loginUseCase.currentUser();
    return user?.userName?.charAt(0)?.toUpperCase() ?? '?';
  }

  getStatusClass(status: CombatStatus): string {
    switch (status) {
      case CombatStatus.NOT_STARTED: return 'status-not-started';
      case CombatStatus.ACTIVE: return 'status-active';
      case CombatStatus.PAUSED: return 'status-paused';
      case CombatStatus.ENDED: return 'status-ended';
      default: return '';
    }
  }

  getStatusLabel(status: CombatStatus): string {
    switch (status) {
      case CombatStatus.NOT_STARTED: return 'Not Started';
      case CombatStatus.ACTIVE: return 'Active';
      case CombatStatus.PAUSED: return 'Paused';
      case CombatStatus.ENDED: return 'Ended';
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
