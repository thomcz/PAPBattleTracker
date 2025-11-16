import {Injectable} from '@angular/core';
import {StoragePort} from '../../core/ports/storage.port';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageAdapter extends StoragePort {
  override setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  override getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  override removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  override clear(): void {
    localStorage.clear()
  }

}
