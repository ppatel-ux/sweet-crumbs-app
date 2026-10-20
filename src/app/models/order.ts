export const FLAVOURS = ['Chocolate', 'Vanilla', 'Red Velvet', 'Butterscotch'] as const;
export const DELIVERY_TOWNS = ['Northfield', 'Southbay'] as const;
export const ORDER_STATUSES = [
  'New',
  'Baking',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
] as const;

export type Flavour = (typeof FLAVOURS)[number];
export type DeliveryTown = (typeof DELIVERY_TOWNS)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  orderNumber: string;
  accountName: string;
  flavour: Flavour;
  sizeKg: number;
  deliveryDate: string;
  deliveryTown: DeliveryTown;
  status: OrderStatus;
  price?: number;
  bigOrder: boolean;
  webReference?: string;
}

export type NewOrder = Omit<Order, 'orderNumber' | 'bigOrder'>;
