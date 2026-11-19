import { Component, input } from '@angular/core';
import { Order } from '../models/order';

@Component({
  selector: 'app-order-bake-tab-page',
  standalone: true,
  templateUrl: './order-bake-tab-page.html',
  styleUrl: './order-tabs.scss',
})
export class BakeTabPage {
  readonly orderNumber = input.required<string>();
  readonly order = input.required<Order>();
}
