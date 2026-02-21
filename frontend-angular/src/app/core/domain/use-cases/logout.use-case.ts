import {Injectable} from '@angular/core';
import {StoragePort} from '../../ports/storage.port';
import {NavigationPort} from '../../ports/navigation.port';
import {LoginUseCase} from './login.use-case';

@Injectable({
  providedIn: 'root',
})
export class LogoutUseCase {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private readonly navigationPort: NavigationPort,
    private readonly storage: StoragePort,
    private readonly loginUseCase: LoginUseCase,
  ) {
  }

  execute() {
    this.storage.removeItem(this.USER_KEY);
    this.storage.removeItem(this.TOKEN_KEY);
    this.loginUseCase.clearAuthState();

    this.navigationPort.navigate(['/login']);
  }
}
