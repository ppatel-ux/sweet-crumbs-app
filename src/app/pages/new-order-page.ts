import { Component, DestroyRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize, startWith } from 'rxjs';
import { APP_CONFIG } from '../app-config';
import { HasUnsavedChanges } from '../models/has-unsaved-changes';
import { DELIVERY_TOWNS, DeliveryTown, FLAVOURS, NewOrder, OrderStatus, ORDER_STATUSES } from '../models/order';
import { ActivityLogService } from '../services/activity-log.service';
import { ErrorMessageService } from '../services/error-message.service';
import { LoadingService } from '../services/loading.service';
import { OrderService } from '../services/order.service';
import { noPastDate, nonBlank, priceNeededToDeliver } from '../validators/order.validators';

@Component({
  selector: 'app-new-order-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-order-page.html',
  styleUrl: './page.scss',
})
export class NewOrderPage implements HasUnsavedChanges {
  readonly config = inject(APP_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly activityLog = inject(ActivityLogService);
  readonly errorMessages = inject(ErrorMessageService);
  readonly loading = inject(LoadingService);
  isSavingOrder = false;
  isBigOrder = false;
  readonly flavours = FLAVOURS;
  readonly deliveryTowns = DELIVERY_TOWNS;
  readonly orderStatuses = ORDER_STATUSES;
  readonly orderForm = new FormGroup(
    {
      accountName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), nonBlank],
      }),
      flavour: new FormControl<(typeof FLAVOURS)[number] | ''>('', Validators.required),
      sizeKg: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(this.config.minSizeKg),
        Validators.max(this.config.maxSizeKg),
      ]),
      deliveryDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, noPastDate],
      }),
      deliveryTown: new FormControl<DeliveryTown | ''>('', Validators.required),
      status: new FormControl<OrderStatus>('New', { nonNullable: true }),
      price: new FormControl<number | null>(null),
    },
    { validators: priceNeededToDeliver },
  );

  constructor() {
    this.orderForm.controls.sizeKg.valueChanges
      .pipe(startWith(this.orderForm.controls.sizeKg.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((sizeKg) => {
        this.isBigOrder = sizeKg !== null && sizeKg >= this.config.bigOrderKg;
      });
  }

  hasUnsavedChanges(): boolean {
    return this.orderForm.dirty;
  }

  submitOrder(): void {
    if (this.isSavingOrder) {
      return;
    }

    this.orderForm.controls.accountName.setValue(this.orderForm.controls.accountName.value.trim());
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const values = this.orderForm.getRawValue();
    if (!values.flavour || !values.deliveryTown || values.sizeKg === null) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const newOrder: NewOrder = {
      accountName: values.accountName,
      flavour: values.flavour,
      sizeKg: values.sizeKg,
      deliveryDate: values.deliveryDate,
      deliveryTown: values.deliveryTown,
      status: values.status,
      price: values.price,
    };

    this.isSavingOrder = true;
    this.orderService
      .add(newOrder)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.isSavingOrder = false)),
      )
      .subscribe({
        next: (createdOrder) => {
          this.activityLog.add(`Order created: ${createdOrder.orderNumber}`);
          this.orderForm.reset({
            accountName: '',
            flavour: '',
            sizeKg: null,
            deliveryDate: '',
            deliveryTown: '',
            status: 'New',
            price: null,
          });
          void this.router.navigate(['/orders', createdOrder.orderNumber]);
        },
        error: () => this.handleOrderRequestError(),
      });
  }

  private handleOrderRequestError(): void {
    // The error interceptor shows the friendly message in the page banner.
  }

  showOrderError(controlName: keyof typeof this.orderForm.controls): boolean {
    const control = this.orderForm.controls[controlName];
    return control.touched && control.invalid;
  }

  showPriceRequiredError(): boolean {
    return (
      this.orderForm.hasError('priceRequired') &&
      (this.orderForm.controls.status.touched || this.orderForm.controls.price.touched)
    );
  }

  orderErrorMessage(controlName: keyof typeof this.orderForm.controls): string {
    const control = this.orderForm.controls[controlName];
    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('nonBlank')) {
      return 'Enter a customer name.';
    }
    if (control.hasError('minlength')) {
      return 'Enter at least 3 characters.';
    }
    if (control.hasError('min') || control.hasError('max')) {
      return `Size must be between ${this.config.minSizeKg} and ${this.config.maxSizeKg} kg.`;
    }
    if (control.hasError('pastDate')) {
      return "Delivery date can't be in the past.";
    }
    if (control.hasError('invalidDate')) {
      return 'Enter a valid delivery date.';
    }
    return 'Check this value.';
  }
}
