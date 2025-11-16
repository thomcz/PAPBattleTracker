import {Injectable} from '@angular/core';
import {NavigationPort} from '../../core/ports/navigation.port';
import {NavigationExtras, Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AngularRouterAdapter extends NavigationPort {
  constructor(private readonly router: Router) {
    super();
  }

  override navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(commands, extras);
  }

  override navigateByUrl(url: string): Promise<boolean> {
    return this.router.navigateByUrl(url)
  }

}
