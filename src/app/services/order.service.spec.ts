import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, AppConfig } from '../app-config';
import { ActivityLogService } from './activity-log.service';
import { OrderService } from './order.service';

describe('OrderService', () => {
  const defaultConfig: AppConfig = {
    minSizeKg: 0.5,
    maxSizeKg: 10,
    bigOrderKg: 5,
    apiBaseUrl: 'http://localhost:3000/api',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: defaultConfig }],
    });
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

  it('uses the configured big-order threshold for seed and new orders', () => {
    TestBed.overrideProvider(APP_CONFIG, {
      useValue: { ...defaultConfig, bigOrderKg: 3 },
    });
    const service = TestBed.inject(OrderService);

    expect(service.getAll().find((order) => order.orderNumber === 'SCO-0002')?.bigOrder).toBe(true);
    expect(
      service.add({
        accountName: 'Threshold Customer',
        flavour: 'Vanilla',
        sizeKg: 3,
        deliveryDate: '2026-10-30',
        deliveryTown: 'Southbay',
        status: 'New',
      }).bigOrder,
    ).toBe(true);
  });
});
