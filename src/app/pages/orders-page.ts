import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of, Subject, switchMap } from 'rxjs';
import { DeliveryTown, Order, OrderStatus, ORDER_STATUSES, DELIVERY_TOWNS } from '../models/order';
import { ErrorMessageService } from '../services/error-message.service';
import { LoadingService } from '../services/loading.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './orders-page.html',
  styleUrl: './page.scss',
})
export class OrdersPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly errorMessages = inject(ErrorMessageService);
  readonly loading = inject(LoadingService);
  orders: Order[] = [];
  isLoadingOrders = false;
  orderSearchTerm = '';
  readonly statusFilter = signal<OrderStatus | ''>('');
  readonly townFilter = signal<DeliveryTown | ''>('');
  readonly pendingOrderIds = new Set<string>();
  readonly deliveryTowns = DELIVERY_TOWNS;
  readonly orderStatuses = ORDER_STATUSES;
  private readonly orderRequests = new Subject<{ searchTerm: string; town: DeliveryTown | '' }>();

  constructor() {
    this.orderRequests
      .pipe(
        switchMap(({ searchTerm, town }) => {
          this.isLoadingOrders = true;
          return this.orderService.getAll(searchTerm, town).pipe(
            map((orders) => ({ orders, failed: false })),
            catchError(() => of({ orders: [] as Order[], failed: true })),
            finalize(() => (this.isLoadingOrders = false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ orders, failed }) => {
        this.orders = orders;
        if (failed) {
          this.handleOrderRequestError();
        }
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const status = params.get('status');
      const town = params.get('town');
      this.statusFilter.set(ORDER_STATUSES.find((candidate) => candidate === status) ?? '');
      this.townFilter.set(DELIVERY_TOWNS.find((candidate) => candidate === town) ?? '');
      this.loadOrders();
    });
  }

  get filteredOrders(): Order[] {
    const statusFilter = this.statusFilter();
    const townFilter = this.townFilter();
    return this.orders.filter(
      (order) =>
        (!statusFilter || order.status === statusFilter) &&
        (!townFilter || order.deliveryTown === townFilter),
    );
  }

  updateStatusFilter(status: OrderStatus | ''): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: status || null },
      queryParamsHandling: 'merge',
    });
  }

  updateStatusFilterFromEvent(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value;
    this.updateStatusFilter(ORDER_STATUSES.find((status) => status === value) ?? '');
  }

  updateTownFilter(town: DeliveryTown | ''): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { town: town || null },
      queryParamsHandling: 'merge',
    });
  }

  updateTownFilterFromEvent(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value;
    this.updateTownFilter(DELIVERY_TOWNS.find((town) => town === value) ?? '');
  }

  clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: null, town: null },
      queryParamsHandling: 'merge',
    });
  }

  changeOrderStatus(order: Order, status: OrderStatus): void {
    if (this.pendingOrderIds.has(order.id)) {
      return;
    }

    this.pendingOrderIds.add(order.id);
    this.orderService
      .changeStatus(order.id, status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pendingOrderIds.delete(order.id)),
      )
      .subscribe({
        next: (updatedOrder) => {
          this.orders = this.orders.map((current) =>
            current.id === updatedOrder.id ? updatedOrder : current,
          );
        },
        error: () => this.handleOrderRequestError(),
      });
  }

  deleteOrder(order: Order): void {
    if (
      this.pendingOrderIds.has(order.id) ||
      !window.confirm(`Delete ${order.orderNumber}?`)
    ) {
      return;
    }

    this.pendingOrderIds.add(order.id);
    this.orderService
      .delete(order.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pendingOrderIds.delete(order.id)),
      )
      .subscribe({
        next: () => {
          this.orders = this.orders.filter((current) => current.id !== order.id);
        },
        error: () => this.handleOrderRequestError(),
      });
  }

  loadOrders(): void {
    this.orderRequests.next({
      searchTerm: this.orderSearchTerm,
      town: this.townFilter(),
    });
  }

  private handleOrderRequestError(): void {
    // The error interceptor shows the friendly message in the page banner.
  }
}
