import {Observable} from 'rxjs';

export abstract class HttpClientPort {
  abstract post<T>(url: string, body: any): Observable<T>;

  abstract get<T>(url: string): Observable<T>;

  abstract put<T>(url: string, body: any): Observable<T>;

  abstract delete<T>(url: string): Observable<T>;
}
