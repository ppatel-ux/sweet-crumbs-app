import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../app-config';
import { ErrorMessageService } from '../services/error-message.service';
import { LoadingService } from '../services/loading.service';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loadingInterceptor } from './loading.interceptor';

const apiBaseUrl = 'http://localhost:3000/api';

describe('HTTP interceptors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
        provideHttpClient(
          withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
        ),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  function triggerFailure(url: string, respond: (request: TestRequest) => void): string {
    let message = '';
    TestBed.inject(HttpClient)
      .get(url)
      .subscribe({
        error: (error: Error) => {
          message = error.message;
        },
      });
    respond(TestBed.inject(HttpTestingController).expectOne(url));
    return message;
  }

  it('adds the token only to requests sent to the configured API', () => {
    const http = TestBed.inject(HttpClient);
    http.get(`${apiBaseUrl}/orders`).subscribe();
    http.get('https://example.test/data').subscribe();

    const apiRequest = TestBed.inject(HttpTestingController).expectOne(`${apiBaseUrl}/orders`);
    const otherRequest = TestBed.inject(HttpTestingController).expectOne(
      'https://example.test/data',
    );
    expect(apiRequest.request.headers.get('Authorization')).toBe('Bearer sweetcrumbs-token');
    expect(otherRequest.request.headers.has('Authorization')).toBe(false);
    apiRequest.flush([]);
    otherRequest.flush({});
  });

  it('uses the server message and only the first validation detail for status 400', () => {
    const message = triggerFailure(`${apiBaseUrl}/orders`, (request) => {
      request.flush(
        {
          message: 'Validation failed.',
          errors: [
            { field: 'sizeKg', message: 'Size must be between 0.5 and 10 kg.' },
            { field: 'deliveryDate', message: 'Delivery date cannot be in the past.' },
          ],
        },
        { status: 400, statusText: 'Bad Request' },
      );
    });

    expect(message).toBe('Validation failed. Size must be between 0.5 and 10 kg.');
    expect(TestBed.inject(ErrorMessageService).message()).toBe(message);
  });

  it('shows the friendly 401, 404, and other server error messages', () => {
    const unauthorized = triggerFailure(`${apiBaseUrl}/orders`, (request) => {
      request.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
    const notFound = triggerFailure(`${apiBaseUrl}/fail/404`, (request) => {
      request.flush({}, { status: 404, statusText: 'Not Found' });
    });
    const serverError = triggerFailure(`${apiBaseUrl}/fail/500`, (request) => {
      request.flush({}, { status: 500, statusText: 'Server Error' });
    });

    expect(unauthorized).toBe('Not allowed. The server rejected the token.');
    expect(notFound).toBe('That order no longer exists.');
    expect(serverError).toBe('Server error (500).');
  });

  it('shows the connection message and decrements concurrent requests on completion or error', () => {
    const http = TestBed.inject(HttpClient);
    const loading = TestBed.inject(LoadingService);
    http.get(`${apiBaseUrl}/orders`).subscribe();
    http.get(`${apiBaseUrl}/orders?q=hotel`).subscribe({ error: () => undefined });

    expect(loading.activeRequests()).toBe(2);
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne(`${apiBaseUrl}/orders`).flush([]);
    expect(loading.activeRequests()).toBe(1);

    const failedRequest = requests.expectOne(`${apiBaseUrl}/orders?q=hotel`);
    failedRequest.error(new ProgressEvent('error'));

    expect(loading.activeRequests()).toBe(0);
    expect(loading.isLoading()).toBe(false);
    expect(TestBed.inject(ErrorMessageService).message()).toBe(
      'Cannot reach the order server. Is it running?',
    );
  });
});
