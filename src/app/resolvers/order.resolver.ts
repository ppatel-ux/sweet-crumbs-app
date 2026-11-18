import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Order } from '../models/order';
import { OrderService } from '../services/order.service';

export const orderResolver: ResolveFn<Order> = (route) => {
  const router = inject(Router);
  const orderNumber = route.paramMap.get('orderNumber');

  if (!orderNumber) {
    return new RedirectCommand(router.parseUrl('/not-found'));
  }

  return inject(OrderService)
    .loadByNumber(orderNumber)
    .pipe(map((order) => order ?? new RedirectCommand(router.parseUrl('/not-found'))));
};
