import {NavigationExtras} from '@angular/router';

export abstract class NavigationPort {
  abstract navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;

  abstract navigateByUrl(url: string): Promise<boolean>;
}
