import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Order } from '../models/order';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './order-detail-page.html',
  styleUrls: ['./page.scss', './order-detail-page.scss'],
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
