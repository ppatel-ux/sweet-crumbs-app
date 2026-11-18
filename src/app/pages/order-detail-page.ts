import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../models/order';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-detail-page.html',
  styleUrl: './page.scss',
})
export class OrderDetailPage {
  readonly orderNumber = input.required<string>();
  readonly order = input.required<Order>();

  get nextOrderNumber(): string | undefined {
    const match = /^SCO-(\d+)$/.exec(this.orderNumber());
    if (!match) {
      return undefined;
    }

    return `SCO-${String(Number(match[1]) + 1).padStart(match[1].length, '0')}`;
  }
}
