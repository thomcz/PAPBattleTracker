import {Injectable} from '@angular/core';
import {HttpClientPort} from '../../core/ports/http-client.port';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AngularHttpAdapter extends HttpClientPort {

  constructor(private readonly httpClient: HttpClient) {
    super()
  }

  override post<T>(url: string, body: any): Observable<T> {
    return this.httpClient.post<T>(url, body)
  }

  override get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(url)
  }

  override put<T>(url: string, body: any): Observable<T> {
    return this.httpClient.put<T>(url, body)
  }

  override delete<T>(url: string): Observable<T> {
    return this.httpClient.delete<T>(url)
  }

}
