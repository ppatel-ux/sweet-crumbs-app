import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { APP_CONFIG } from './app-config';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Always inherit the parent order's parameters and resolved data in its tab routes.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    // Add auth before the request leaves, translate errors outside loading, and finalize loading last.
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
    ),
    {
      provide: APP_CONFIG,
      useValue: {
        minSizeKg: 0.5,
        maxSizeKg: 10,
        bigOrderKg: 5,
        apiBaseUrl: 'http://localhost:3000/api',
      },
    },
  ]
};
