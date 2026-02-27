import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-session-status-badge',
  standalone: true,
  template: `
    <span class="status-badge" [class]="statusClass">{{ statusLabel }}</span>
  `,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .status-planned { background: rgba(255,255,255,0.15); color: #a0a8c0; }
    .status-started { background: #f0c040; color: #1a1a2e; }
    .status-finished { background: rgba(255,255,255,0.08); color: #6b7280; }
  `]
})
export class SessionStatusBadgeComponent {
  @Input() status: string = '';

  get statusLabel(): string {
    switch (this.status) {
      case 'PLANNED': return 'Planned';
      case 'STARTED': return 'Started';
      case 'FINISHED': return 'Finished';
      default: return this.status;
    }
  }

  get statusClass(): string {
    switch (this.status) {
      case 'PLANNED': return 'status-badge status-planned';
      case 'STARTED': return 'status-badge status-started';
      case 'FINISHED': return 'status-badge status-finished';
      default: return 'status-badge';
    }
  }
}
