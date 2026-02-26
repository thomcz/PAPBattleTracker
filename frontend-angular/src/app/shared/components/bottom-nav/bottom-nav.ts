import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  readonly navItems = [
    {label: 'Sessions', route: '/home', icon: 'sessions'},
    {label: 'Monsters', route: '/beastery', icon: 'monsters'},
    {label: 'Players', route: '/players', icon: 'players'},
  ];
}
