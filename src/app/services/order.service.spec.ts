import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../app-config';
import { Order } from '../models/order';
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
});
