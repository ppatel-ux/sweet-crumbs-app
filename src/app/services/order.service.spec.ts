import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../app-config';
import { NewOrder, Order } from '../models/order';
import { OrderService } from './order.service';

const apiBaseUrl = 'http://localhost:3000/api';

describe('OrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('sends the token and filters as query parameters', () => {
    const service = TestBed.inject(OrderService);
    const httpTesting = TestBed.inject(HttpTestingController);
    let response: Order[] | undefined;

    service.getAll('  Hotel Bluebell  ', 'Northfield').subscribe((orders) => {
      response = orders;
    });

    const request = httpTesting.expectOne(
      `${apiBaseUrl}/orders?q=Hotel%20Bluebell&town=Northfield`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer sweetcrumbs-token');
    request.flush([]);

    expect(response).toEqual([]);
  });

  it('omits empty filters from the request', () => {
    const service = TestBed.inject(OrderService);
    const httpTesting = TestBed.inject(HttpTestingController);

    service.getAll().subscribe();

    const request = httpTesting.expectOne(`${apiBaseUrl}/orders`);
    expect(request.request.params.keys()).toEqual([]);
    request.flush([]);
  });

  it('creates an order with only the fields accepted by the server', () => {
    const service = TestBed.inject(OrderService);
    const httpTesting = TestBed.inject(HttpTestingController);
    const newOrder: NewOrder = {
      accountName: 'New Customer',
      flavour: 'Chocolate',
      sizeKg: 5,
      deliveryDate: '2026-11-30',
      deliveryTown: 'Northfield',
      status: 'New',
      price: 1800,
    };
    const createdOrder: Order = {
      ...newOrder,
      id: '6',
      orderNumber: 'SCO-0006',
      bigOrder: true,
      webReference: null,
    };
    let response: Order | undefined;

    service.create(newOrder).subscribe((order) => {
      response = order;
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/orders`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer sweetcrumbs-token');
    expect(request.request.body).toEqual(newOrder);
    request.flush(createdOrder);

    expect(response).toEqual(createdOrder);
  });

  it('patches only the requested status', () => {
    const service = TestBed.inject(OrderService);
    const httpTesting = TestBed.inject(HttpTestingController);

    service.changeStatus('3', 'Baking').subscribe();

    const request = httpTesting.expectOne(`${apiBaseUrl}/orders/3`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Authorization')).toBe('Bearer sweetcrumbs-token');
    expect(request.request.body).toEqual({ status: 'Baking' });
    request.flush({ id: '3', status: 'Baking' });
  });

  it('completes a delete after the server returns 204 with no body', () => {
    const service = TestBed.inject(OrderService);
    const httpTesting = TestBed.inject(HttpTestingController);
    let deleted = false;

    service.delete('3').subscribe(() => {
      deleted = true;
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/orders/3`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe('Bearer sweetcrumbs-token');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(deleted).toBe(true);
  });
});
