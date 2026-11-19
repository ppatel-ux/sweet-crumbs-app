import { Component, input } from '@angular/core';
import { Order } from '../models/order';

@Component({
  selector: 'app-order-delivery-tab-page',
  standalone: true,
  templateUrl: './order-delivery-tab-page.html',
  styleUrl: './order-tabs.scss',
})
export class DeliveryTabPage {
  readonly orderNumber = input.required<string>();
  readonly order = input.required<Order>();
}
