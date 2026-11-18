import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Order, ORDER_STATUSES } from '../models/order';
import { ErrorMessageService } from '../services/error-message.service';
import { LoadingService } from '../services/loading.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './reports-page.html',
  styleUrl: './page.scss',
})
export class ReportsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderService = inject(OrderService);
  readonly errorMessages = inject(ErrorMessageService);
  readonly loading = inject(LoadingService);
  readonly orderStatuses = ORDER_STATUSES;
  orders: Order[] = [];
  isLoading = true;

  constructor() {
    this.orderService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (orders) => {
          this.orders = orders;
        },
        error: () => {
          this.orders = [];
        },
      });
  }

  countByStatus(status: (typeof ORDER_STATUSES)[number]): number {
    return this.orders.filter((order) => order.status === status).length;
  }

  get bigOrderCount(): number {
    return this.orders.filter((order) => order.bigOrder).length;
  }

  get totalValue(): number {
    return this.orders.reduce((total, order) => total + (order.price ?? 0), 0);
  }
}
