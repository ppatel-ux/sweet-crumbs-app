import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from '../app-config';
import { ActivityLogService } from './activity-log.service';
import { NewOrder, Order } from '../models/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly config = inject(APP_CONFIG);
  private readonly activityLog = inject(ActivityLogService);
  private readonly orders: Order[] = [
    {
      orderNumber: 'SCO-0001',
      accountName: 'Hotel Bluebell',
      flavour: 'Chocolate',
      sizeKg: 2,
      deliveryDate: '2026-10-20',
      deliveryTown: 'Northfield',
      status: 'New',
      price: 1800,
      bigOrder: 2 >= this.config.bigOrderKg,
      webReference: '',
    },
    {
      orderNumber: 'SCO-0002',
      accountName: 'Sunrise School',
      flavour: 'Red Velvet',
      sizeKg: 3.5,
      deliveryDate: '2026-10-22',
      deliveryTown: 'Southbay',
      status: 'Baking',
      price: 2900,
      bigOrder: 3.5 >= this.config.bigOrderKg,
      webReference: '',
    },
    {
      orderNumber: 'SCO-0003',
      accountName: 'TechPark Cafe',
      flavour: 'Vanilla',
      sizeKg: 1,
      deliveryDate: '2026-10-19',
      deliveryTown: 'Northfield',
      status: 'New',
      price: 950,
      bigOrder: 1 >= this.config.bigOrderKg,
      webReference: '',
    },
    {
      orderNumber: 'SCO-0004',
      accountName: 'Harbour Gym',
      flavour: 'Butterscotch',
      sizeKg: 6,
      deliveryDate: '2026-10-25',
      deliveryTown: 'Southbay',
      status: 'New',
      price: 4200,
      bigOrder: 6 >= this.config.bigOrderKg,
      webReference: '',
    },
    {
      orderNumber: 'SCO-0005',
      accountName: 'Hotel Bluebell',
      flavour: 'Chocolate',
      sizeKg: 5,
      deliveryDate: '2026-10-18',
      deliveryTown: 'Northfield',
      status: 'Out for Delivery',
      price: 3600,
      bigOrder: 5 >= this.config.bigOrderKg,
      webReference: '',
    },
  ];
  private nextSequence = this.getHighestSequence() + 1;

  getAll(): Order[] {
    return this.orders;
  }

  add(order: NewOrder): Order {
    const createdOrder: Order = {
      ...order,
      orderNumber: `SCO-${String(this.nextSequence).padStart(4, '0')}`,
      bigOrder: order.sizeKg >= this.config.bigOrderKg,
      webReference: order.webReference ?? '',
    };
    this.nextSequence += 1;
    this.orders.push(createdOrder);
    this.activityLog.add(`Order ${createdOrder.orderNumber} added`);
    return createdOrder;
  }

  private getHighestSequence(): number {
    return this.orders.reduce((highest, order) => {
      const match = /^SCO-(\d+)$/.exec(order.orderNumber);
      const sequence = match ? Number(match[1]) : 0;
      return Number.isSafeInteger(sequence) ? Math.max(highest, sequence) : highest;
    }, 0);
  }
}
