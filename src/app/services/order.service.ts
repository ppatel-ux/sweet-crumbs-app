import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../app-config';
import { DeliveryTown, Order } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getAll(searchTerm = '', town: DeliveryTown | '' = ''): Observable<Order[]> {
    let params = new HttpParams();
    const query = searchTerm.trim();

    if (query) {
      params = params.set('q', query);
    }
    if (town) {
      params = params.set('town', town);
    }

    return this.http.get<Order[]>(`${this.config.apiBaseUrl}/orders`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer sweetcrumbs-token',
      }),
      params,
    });
  }
}
