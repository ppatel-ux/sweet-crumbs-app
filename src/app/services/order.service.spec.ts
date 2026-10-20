import { TestBed } from '@angular/core/testing';
import { ActivityLogService } from './activity-log.service';
import { OrderService } from './order.service';

describe('OrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('starts with the five specified orders and marks large sample orders', () => {
    const orders = TestBed.inject(OrderService).getAll();

    expect(orders.map((order) => order.orderNumber)).toEqual([
      'SCO-0001',
      'SCO-0002',
      'SCO-0003',
      'SCO-0004',
      'SCO-0005',
    ]);
    expect(orders.filter((order) => order.bigOrder).map((order) => order.orderNumber)).toEqual([
      'SCO-0004',
      'SCO-0005',
    ]);
  });

  it('generates consecutive padded order numbers and logs each order', () => {
    const service = TestBed.inject(OrderService);
    const activityLog = TestBed.inject(ActivityLogService);
    const newOrder = {
      accountName: 'New Customer',
      flavour: 'Chocolate' as const,
      sizeKg: 5,
      deliveryDate: '2026-10-30',
      deliveryTown: 'Northfield' as const,
      status: 'New' as const,
      price: 1800,
    };

    const first = service.add(newOrder);
    const second = service.add({ ...newOrder, sizeKg: 0.5 });

    expect(first.orderNumber).toBe('SCO-0006');
    expect(first.bigOrder).toBe(true);
    expect(second.orderNumber).toBe('SCO-0007');
    expect(second.bigOrder).toBe(false);
    expect(activityLog.getAll().slice(0, 2)).toEqual([
      'Order SCO-0007 added',
      'Order SCO-0006 added',
    ]);
  });
});
