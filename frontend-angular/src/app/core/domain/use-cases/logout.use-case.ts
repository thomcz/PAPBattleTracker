import {Injectable} from '@angular/core';
import {StoragePort} from '../../ports/storage.port';
import {NavigationPort} from '../../ports/navigation.port';

@Injectable({
  providedIn: 'root',
})
export class LogoutUseCase {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private readonly navigationPort: NavigationPort,
    private readonly storage: StoragePort,
  ) {
  }

  execute() {
    this.storage.removeItem(this.USER_KEY)
    this.storage.removeItem(this.TOKEN_KEY)

    this.navigationPort.navigate(['/login']);
  }
}
