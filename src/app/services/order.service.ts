import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../app-config';
import { DeliveryTown, NewOrder, Order, OrderStatus } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly authHeaders = new HttpHeaders({
    Authorization: 'Bearer sweetcrumbs-token',
  });

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
      headers: this.authHeaders,
      params,
    });
  }

  create(order: NewOrder): Observable<Order> {
    return this.http.post<Order>(`${this.config.apiBaseUrl}/orders`, order, {
      headers: this.authHeaders,
    });
  }

  changeStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(
      `${this.config.apiBaseUrl}/orders/${id}`,
      { status },
      { headers: this.authHeaders },
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.apiBaseUrl}/orders/${id}`, {
      headers: this.authHeaders,
    });
  }
}
