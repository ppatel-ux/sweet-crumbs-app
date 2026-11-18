import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { APP_CONFIG } from '../app-config';
import { DeliveryTown, NewOrder, Order, OrderStatus } from '../models/order';

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

    return this.http.get<Order[]>(`${this.config.apiBaseUrl}/orders`, { params });
  }

  getByNumber(orderNumber: string): Observable<Order | undefined> {
    return this.getAll().pipe(
      map((orders) => orders.find((order) => order.orderNumber === orderNumber)),
    );
  }

  loadByNumber(orderNumber: string): Observable<Order | undefined> {
    return this.getByNumber(orderNumber).pipe(delay(600));
  }

  add(order: NewOrder): Observable<Order> {
    return this.http.post<Order>(`${this.config.apiBaseUrl}/orders`, order);
  }

  create(order: NewOrder): Observable<Order> {
    return this.add(order);
  }

  changeStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(
      `${this.config.apiBaseUrl}/orders/${id}`,
      { status },
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.apiBaseUrl}/orders/${id}`);
  }
}
