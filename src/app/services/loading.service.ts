import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly requestCount = signal(0);
  readonly activeRequests = this.requestCount.asReadonly();
  readonly isLoading = computed(() => this.requestCount() > 0);

  startRequest(): void {
    this.requestCount.update((count) => count + 1);
  }

  finishRequest(): void {
    this.requestCount.update((count) => Math.max(0, count - 1));
  }
}
