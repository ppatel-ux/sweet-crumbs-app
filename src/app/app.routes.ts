import { Routes } from '@angular/router';
import { EnquiryPage } from './pages/enquiry-page';
import { LoginPage } from './pages/login-page';
import { OrderDetailPage } from './pages/order-detail-page';
import { BakeTabPage } from './pages/order-bake-tab-page';
import { DeliveryTabPage } from './pages/order-delivery-tab-page';
import { NewOrderPage } from './pages/new-order-page';
import { NotFoundPage } from './pages/not-found-page';
import { OrdersPage } from './pages/orders-page';
import { TeamPage } from './pages/team-page';
import { ownerGuard } from './guards/owner.guard';
import { staffGuard } from './guards/staff.guard';
import { unsavedOrderGuard } from './guards/unsaved-order.guard';
import { orderResolver } from './resolvers/order.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'team', pathMatch: 'full', title: 'Team' },
  { path: 'team', component: TeamPage, title: 'Team' },
  { path: 'orders', component: OrdersPage, title: 'Orders' },
  {
    path: 'orders/new',
    component: NewOrderPage,
    canActivate: [staffGuard],
    canDeactivate: [unsavedOrderGuard],
    title: 'New order',
  },
  {
    path: 'orders/:orderNumber',
    component: OrderDetailPage,
    resolve: { order: orderResolver },
    title: 'Order details',
    children: [
      { path: '', redirectTo: 'bake', pathMatch: 'full' },
      { path: 'bake', component: BakeTabPage, title: 'Bake details' },
      { path: 'delivery', component: DeliveryTabPage, title: 'Delivery details' },
    ],
  },
  { path: 'enquiry', component: EnquiryPage, title: 'Customer enquiry' },
  { path: 'login', component: LoginPage, title: 'Login' },
  { path: 'not-found', component: NotFoundPage, title: 'Page not found' },
  {
    path: 'reports',
    canMatch: [ownerGuard],
    loadComponent: () => import('./pages/reports-page').then((module) => module.ReportsPage),
    title: 'Reports',
  },
  { path: '**', component: NotFoundPage, title: 'Page not found' },
];
