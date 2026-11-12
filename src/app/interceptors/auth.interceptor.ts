import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../app-config';

const API_TOKEN = 'sweetcrumbs-token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(APP_CONFIG).apiBaseUrl;

  if (!request.url.startsWith(apiBaseUrl)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${API_TOKEN}` },
    }),
  );
};
