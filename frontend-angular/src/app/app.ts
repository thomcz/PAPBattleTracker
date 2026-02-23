import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BottomNav} from './shared/components/bottom-nav/bottom-nav';
import {LoginUseCase} from './core/domain/use-cases/login.use-case';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNav],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(public loginUseCase: LoginUseCase) {}
}
