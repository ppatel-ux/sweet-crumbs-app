import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app';
import { APP_CONFIG } from './app-config';
import { routes } from './app.routes';
import { Order } from './models/order';
import { OrderDetailPage } from './pages/order-detail-page';
import { LoginPage } from './pages/login-page';
import { NewOrderPage } from './pages/new-order-page';
import { OrdersPage } from './pages/orders-page';
import { TeamPage } from './pages/team-page';
import { AuthService } from './services/auth.service';
import { OrderService } from './services/order.service';
import { TeamService } from './services/team.service';

const orderOne: Order = {
  id: '1',
  orderNumber: 'SCO-0001',
  accountName: 'Hotel Bluebell',
  flavour: 'Chocolate',
  sizeKg: 2,
  deliveryDate: '2026-11-20',
  deliveryTown: 'Northfield',
  status: 'New',
  price: 1800,
  bigOrder: false,
  webReference: null,
};

const orderTwo: Order = {
  id: '2',
  orderNumber: 'SCO-0002',
  accountName: 'Sunrise School',
  flavour: 'Red Velvet',
  sizeKg: 3.5,
  deliveryDate: '2026-11-22',
  deliveryTown: 'Southbay',
  status: 'Baking',
  price: 2900,
  bigOrder: false,
  webReference: null,
};

const orderThree: Order = { ...orderTwo, id: '3', orderNumber: 'SCO-0003' };

describe('application routing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        {
          provide: APP_CONFIG,
          useValue: {
            minSizeKg: 0.5,
            maxSizeKg: 10,
            bigOrderKg: 5,
            apiBaseUrl: 'http://localhost:3000/api',
          },
        },
        {
          provide: OrderService,
          useValue: {
            getAll: vi.fn(() => of([orderOne, orderTwo, orderThree])),
            getByNumber: vi.fn((number: string) => {
              const found =
                number === orderTwo.orderNumber
                  ? orderTwo
                  : number === orderThree.orderNumber
                    ? orderThree
                    : undefined;
              return of(found);
            }),
            loadByNumber: vi.fn((number: string) => {
              const found =
                number === orderTwo.orderNumber
                  ? orderTwo
                  : number === orderThree.orderNumber
                    ? orderThree
                    : undefined;
              return of(found);
            }),
            add: vi.fn(() => of(orderThree)),
            create: vi.fn(),
            changeStatus: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates the order detail when the route parameter changes on the same component', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/orders/SCO-0002');
    await fixture.whenStable();
    fixture.detectChanges();
    const detailPage = fixture.debugElement.query(By.directive(OrderDetailPage)).componentInstance;
    expect(fixture.nativeElement.textContent).toContain('Sunrise School');

    await router.navigateByUrl('/orders/SCO-0003');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.directive(OrderDetailPage)).componentInstance,
    ).toBe(detailPage);
    expect(fixture.nativeElement.textContent).toContain('SCO-0003');

    await router.navigateByUrl('/orders/SCO-0004');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/not-found');
    expect(fixture.nativeElement.textContent).toContain('Page not found');
  });

  it('keeps status and town filters in the URL and restores them from query parameters', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/orders');
    await fixture.whenStable();
    fixture.detectChanges();
    const ordersPage = fixture.debugElement.query(By.directive(OrdersPage)).componentInstance;

    ordersPage.updateStatusFilter('Baking');
    await fixture.whenStable();
    ordersPage.updateTownFilter('Southbay');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/orders?status=Baking&town=Southbay');
    expect(ordersPage.filteredOrders.map((order: Order) => order.orderNumber)).toEqual([
      'SCO-0002',
      'SCO-0003',
    ]);
    expect(ordersPage.statusFilter()).toBe('Baking');
    expect(ordersPage.townFilter()).toBe('Southbay');
    expect(fixture.nativeElement.querySelector('#order-status-filter').value).toBe('Baking');
    expect(fixture.nativeElement.querySelector('#order-town-filter').value).toBe('Southbay');

    await router.navigateByUrl('/orders?status=New&town=Northfield');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(ordersPage.statusFilter()).toBe('New');
    expect(ordersPage.townFilter()).toBe('Northfield');
    expect(ordersPage.filteredOrders.map((order: Order) => order.orderNumber)).toEqual(['SCO-0001']);

    ordersPage.clearFilters();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/orders');
    expect(ordersPage.filteredOrders).toHaveLength(3);
  });

  it('requires selecting a visible team card after changing the name search', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    const teamService = TestBed.inject(TeamService);
    fixture.detectChanges();

    await router.navigateByUrl('/team');
    await fixture.whenStable();
    fixture.detectChanges();

    const teamPage = fixture.debugElement.query(By.directive(TeamPage)).componentInstance;
    teamPage.selectMember(teamService.getAll()[0]);
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector(
      'input[aria-label="Search team members"]',
    ) as HTMLInputElement;
    searchInput.value = 'a';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(teamPage.searchTerm).toBe('a');
    expect(teamPage.selectedMember).toBeNull();
    teamPage.newName = 'Updated Meera';
    teamPage.changeSelectedName();
    expect(teamService.getAll()[0].name).toBe('Meera Joshi');

    const sara = teamService.getAll().find((member) => member.name === 'Sara Khan');
    if (!sara) {
      throw new Error('Sara Khan should be in the filtered team results.');
    }

    teamPage.selectMember(sara);
    teamPage.newName = 'Sara Updated';
    teamPage.changeSelectedName();

    expect(teamService.getAll()[0].name).toBe('Meera Joshi');
    expect(teamService.getAll().find((member) => member.name === 'Sara Updated')).toBeDefined();
    expect(teamPage.selectedMember?.name).toBe('Sara Updated');
  });

  it('navigates to the created order detail after saving', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    TestBed.inject(AuthService).login('staff');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.detectChanges();
    await router.navigateByUrl('/orders/new');
    await fixture.whenStable();
    const newOrderPage = fixture.debugElement.query(By.directive(NewOrderPage)).componentInstance;
    newOrderPage.orderForm.setValue({
      accountName: 'New Customer',
      flavour: 'Chocolate',
      sizeKg: 2,
      deliveryDate: '2026-12-01',
      deliveryTown: 'Northfield',
      status: 'New',
      price: 1800,
    });
    newOrderPage.orderForm.markAsDirty();

    newOrderPage.submitOrder();
    await fixture.whenStable();

    expect(router.url).toBe('/orders/SCO-0003');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks before leaving a dirty order and blocks navigation when declined', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    TestBed.inject(AuthService).login('staff');
    fixture.detectChanges();
    await router.navigateByUrl('/orders/new');
    const newOrderPage = fixture.debugElement.query(By.directive(NewOrderPage)).componentInstance;
    newOrderPage.orderForm.markAsDirty();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

    expect(await router.navigateByUrl('/team')).toBe(false);
    expect(router.url).toBe('/orders/new');
    expect(await router.navigateByUrl('/team')).toBe(true);
    expect(router.url).toBe('/team');
    expect(confirm).toHaveBeenNthCalledWith(1, 'You have an unsaved order. Leave this page?');
    expect(confirm).toHaveBeenNthCalledWith(2, 'You have an unsaved order. Leave this page?');
  });

  it('does not ask before leaving an untouched order form', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    TestBed.inject(AuthService).login('staff');
    fixture.detectChanges();
    await router.navigateByUrl('/orders/new');
    const confirm = vi.spyOn(window, 'confirm');

    expect(await router.navigateByUrl('/team')).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('redirects guests to login and returns staff to the protected route', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/orders/new');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/login?returnUrl=%2Forders%2Fnew');
    expect(fixture.debugElement.query(By.directive(LoginPage))).toBeTruthy();

    fixture.debugElement
      .query(By.directive(LoginPage))
      .componentInstance.loginAs('staff');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/orders/new');
    expect(fixture.debugElement.query(By.directive(NewOrderPage))).toBeTruthy();
  });

  it('uses client-side navigation and renders each requested route', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(router.url).toBe('/team');
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Sweet Crumbs team');

    await router.navigateByUrl('/orders');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#orders-heading')?.textContent).toContain('Orders');

    TestBed.inject(AuthService).login('staff');
    fixture.detectChanges();
    await router.navigateByUrl('/orders/new');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#new-order-heading')?.textContent).toContain(
      'New order',
    );

    await router.navigateByUrl('/enquiry');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#enquiry-form')).toBeTruthy();

    await router.navigateByUrl('/xyz');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Page not found');
  });

  it('defines a full-match default redirect, page titles, and a final fallback', () => {
    expect(routes[0]).toMatchObject({ path: '', redirectTo: 'team', pathMatch: 'full' });
    expect(routes.every((route) => typeof route.title === 'string')).toBe(true);
    expect(routes[routes.length - 1].path).toBe('**');
  });

  it('renders application navigation with router links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('nav a')) as HTMLAnchorElement[];
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Team',
      'Orders',
      'Enquiry',
      'Login',
    ]);
    expect(links.every((link) => link.hasAttribute('routerlink'))).toBe(true);
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/orders/new"]')).toBeNull();
  });

  it('shows the signed-in role and protected link, then logs out', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    TestBed.inject(AuthService).login('owner');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Logged in: owner');
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/orders/new"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/login"]')).toBeNull();

    (fixture.nativeElement.querySelector('.navigation-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/team');
    expect(TestBed.inject(AuthService).currentUser()).toBeNull();
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/login"]')).toBeTruthy();
  });

  it('matches reports only for an owner', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    const auth = TestBed.inject(AuthService);
    fixture.detectChanges();

    await router.navigateByUrl('/reports');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Page not found');
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/reports"]')).toBeNull();

    auth.login('staff');
    await router.navigateByUrl('/team');
    await router.navigateByUrl('/reports');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Page not found');
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/reports"]')).toBeNull();

    auth.login('owner');
    await router.navigateByUrl('/team');
    await router.navigateByUrl('/reports');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Reports');
    expect(fixture.nativeElement.querySelector('nav a[routerlink="/reports"]')).toBeTruthy();
  });
});
