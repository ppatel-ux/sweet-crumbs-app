import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorMessageService } from '../services/error-message.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getFriendlyErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Server error (0).';
  }

  if (error.status === 0) {
    return 'Cannot reach the order server. Is it running?';
  }
  if (error.status === 401) {
    return 'Not allowed. The server rejected the token.';
  }
  if (error.status === 404) {
    return 'That order no longer exists.';
  }
  if (error.status === 400) {
    const body = isRecord(error.error) ? error.error : null;
    const serverMessage =
      body && typeof body['message'] === 'string' ? body['message'] : 'Server error (400).';
    const errors = body?.['errors'];
    const firstError = Array.isArray(errors) ? errors[0] : null;
    const detail =
      isRecord(firstError) && typeof firstError['message'] === 'string'
        ? firstError['message']
        : '';

    return detail ? `${serverMessage} ${detail}` : serverMessage;
  }

  return `Server error (${error.status}).`;
}

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorMessages = inject(ErrorMessageService);
  errorMessages.clear();

  return next(request).pipe(
    catchError((error: unknown) => {
      const message = getFriendlyErrorMessage(error);
      errorMessages.show(message);
      return throwError(() => new Error(message));
    }),
  );
};
