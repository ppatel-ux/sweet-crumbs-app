import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { App } from './app';
import { APP_CONFIG } from './app-config';
import { Order } from './models/order';
import { ActivityLogService } from './services/activity-log.service';
import { ErrorMessageService } from './services/error-message.service';
import { LoadingService } from './services/loading.service';
import { OrderService } from './services/order.service';
import { TeamService } from './services/team.service';

const sampleOrders: Order[] = [
  {
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
  },
  {
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
  },
  {
    id: '3',
    orderNumber: 'SCO-0003',
    accountName: 'TechPark Cafe',
    flavour: 'Vanilla',
    sizeKg: 1,
    deliveryDate: '2026-11-19',
    deliveryTown: 'Northfield',
    status: 'New',
    price: 950,
    bigOrder: false,
    webReference: null,
  },
  {
    id: '4',
    orderNumber: 'SCO-0004',
    accountName: 'Harbour Gym',
    flavour: 'Butterscotch',
    sizeKg: 6,
    deliveryDate: '2026-11-25',
    deliveryTown: 'Southbay',
    status: 'New',
    price: 4200,
    bigOrder: true,
    webReference: null,
  },
  {
    id: '5',
    orderNumber: 'SCO-0005',
    accountName: 'Hotel Bluebell',
    flavour: 'Chocolate',
    sizeKg: 5,
    deliveryDate: '2026-11-18',
    deliveryTown: 'Northfield',
    status: 'Out for Delivery',
    price: 3600,
    bigOrder: true,
    webReference: null,
  },
];

const createdOrder: Order = {
  ...sampleOrders[0],
  id: '6',
  orderNumber: 'SCO-0006',
  accountName: 'New Customer',
  flavour: 'Vanilla',
  sizeKg: 0.5,
  deliveryDate: '2026-11-30',
  deliveryTown: 'Southbay',
  price: null,
};

function futureDeliveryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
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
            getAll: vi.fn(() => of(sampleOrders)),
            create: vi.fn(() => of(createdOrder)),
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the Sweet Crumbs team title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Sweet Crumbs team');
  });

  it('stores the supplied details and formats values on each card', () => {
    const team = TestBed.inject(TeamService).getAll();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(team.map((member) => [
      member.joinedOn.getFullYear(),
      member.joinedOn.getMonth() + 1,
      member.joinedOn.getDate(),
      member.monthlyBonus,
      member.targetAchieved,
    ])).toEqual([
      [2019, 4, 15, 25000.5, 0.92],
      [2022, 8, 1, 12500, 0.78],
      [2023, 2, 20, 15750.75, 1.05],
      [2024, 6, 10, 8200.25, 0.86],
    ]);

    const firstCard = fixture.nativeElement.querySelector('app-team-card') as HTMLElement;
    expect(firstCard.textContent).toContain('Apr 15, 2019');
    expect(firstCard.textContent).toContain('₹25,000.50');
    expect(firstCard.textContent).toContain('92%');
    expect(fixture.nativeElement.textContent).toContain('105%');
  });

  it('changes the joined date style on every card', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.dateFormat = 'longDate';
    fixture.detectChanges();

    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('app-team-card'),
    ) as HTMLElement[];
    expect(
      cards.map((card) =>
        card.textContent?.match(/(?:April|August|February|June) \d+, \d{4}/)?.[0],
      ),
    ).toEqual(['April 15, 2019', 'August 1, 2022', 'February 20, 2023', 'June 10, 2024']);
  });

  it('offers short, medium, and long date styles and shows the live clock', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('#date-format option'),
    ) as HTMLOptionElement[];

    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Short',
      'Medium',
      'Long',
    ]);
    expect(fixture.nativeElement.querySelector('.last-updated')?.textContent).toContain(
      'Last updated:',
    );
  });

  it('adds a team member immediately with a new array reference', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const originalTeam = app.team;

    app.addTeamMember();
    fixture.detectChanges();

    expect(app.team).toHaveLength(5);
    expect(app.team).not.toBe(originalTeam);
    expect(fixture.nativeElement.textContent).toContain('New team member 5');
  });

  it('filters the added member by name', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.addTeamMember();
    app.searchTerm = 'new team member';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-team-card')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('New team member 5');
  });

  it('updates the team array when a member name changes', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const originalTeam = app.team;
    app.selectMember(app.team[0]);
    app.newName = 'Meera Joshi Updated';

    app.changeSelectedName();
    fixture.detectChanges();

    expect(app.team).not.toBe(originalTeam);
    expect(fixture.nativeElement.textContent).toContain('Meera Joshi Updated');
  });

  it('copies a summary with a date formatted by DatePipe', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const copyButton = fixture.nativeElement.querySelector(
      '.copy-button',
    ) as HTMLButtonElement;

    copyButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith(
      'Meera Joshi, Founder and Sales Head, joined 15 Apr 2019',
    );
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Summary copied.',
    );
  });

  it('renders every sample order and marks the two big orders', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('.orders-table tbody tr');

    expect(rows).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('.big-order-badge')).toHaveLength(2);
  });

  it('clears the order list and finishes loading when the order request fails', () => {
    const ordersResponse = new Subject<Order[]>();
    TestBed.overrideProvider(OrderService, {
      useValue: { getAll: vi.fn(() => ordersResponse) },
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(false);

    expect(fixture.nativeElement.textContent).toContain('Loading orders');

    ordersResponse.error(new Error('Server unavailable'));
    fixture.detectChanges(false);

    expect(fixture.componentInstance.isLoadingOrders).toBe(false);
    expect(fixture.componentInstance.orders).toEqual([]);
  });

  it('shows a shared API error at the top of the page', () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(ErrorMessageService).show('Not allowed. The server rejected the token.');
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.server-error-banner') as HTMLElement;
    expect(banner.textContent).toContain('Not allowed. The server rejected the token.');
    expect(
      fixture.nativeElement.querySelector(
        'section[aria-labelledby="new-order-heading"] .server-error-banner',
      ),
    ).toBeNull();
  });

  it('shows the shared loading indicator while requests are active', () => {
    const fixture = TestBed.createComponent(App);
    const loading = TestBed.inject(LoadingService);

    loading.startRequest();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Talking to the server…');

    loading.finishRequest();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Talking to the server…');
  });

  it('requests server-side filters when the orders are searched', () => {
    const getAll = vi.fn(() => of(sampleOrders));
    TestBed.overrideProvider(OrderService, { useValue: { getAll } });
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.orderSearchTerm = 'Hotel';
    app.selectedTown = 'Northfield';

    app.loadOrders();

    expect(getAll).toHaveBeenLastCalledWith('Hotel', 'Northfield');
  });

  it('does not add an invalid order and marks every control touched on submit', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const orderCount = app.orders.length;
    app.orderForm.controls.accountName.setValue('Valid Customer');
    app.orderForm.controls.flavour.setValue('Chocolate');
    app.orderForm.controls.sizeKg.setValue(10.1);
    app.orderForm.controls.deliveryDate.setValue(futureDeliveryDate());
    app.orderForm.controls.deliveryTown.setValue('Northfield');

    app.submitOrder();

    expect(app.orders).toHaveLength(orderCount);
    expect(app.orderForm.invalid).toBe(true);
    expect(Object.values(app.orderForm.controls).every((control) => control.touched)).toBe(true);
  });

  it('trims the customer name before validating the minimum length', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const orderCount = app.orders.length;
    app.orderForm.setValue({
      accountName: '  a  ',
      flavour: 'Chocolate',
      sizeKg: 2,
      deliveryDate: futureDeliveryDate(),
      deliveryTown: 'Northfield',
      status: 'New',
      price: null,
    });

    app.submitOrder();

    expect(app.orderForm.controls.accountName.value).toBe('a');
    expect(app.orderForm.controls.accountName.hasError('minlength')).toBe(true);
    expect(app.orders).toHaveLength(orderCount);
  });

  it('creates a valid order, resets the form, and logs the server order number', () => {
    const createOrder = vi.fn(() => of(createdOrder));
    TestBed.overrideProvider(OrderService, {
      useValue: { getAll: () => of(sampleOrders), create: createOrder },
    });
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const deliveryDate = futureDeliveryDate();
    app.orderForm.setValue({
      accountName: 'New Customer',
      flavour: 'Vanilla',
      sizeKg: 0.5,
      deliveryDate,
      deliveryTown: 'Southbay',
      status: 'New',
      price: null,
    });

    app.submitOrder();

    expect(createOrder).toHaveBeenCalledWith({
      accountName: 'New Customer',
      flavour: 'Vanilla',
      sizeKg: 0.5,
      deliveryDate,
      deliveryTown: 'Southbay',
      status: 'New',
      price: null,
    });
    expect(app.orders).toHaveLength(6);
    expect(app.orders[5]).toEqual(createdOrder);
    expect(app.orderForm.getRawValue()).toEqual({
      accountName: '',
      flavour: '',
      sizeKg: null,
      deliveryDate: '',
      deliveryTown: '',
      status: 'New',
      price: null,
    });
    expect(app.recentActivities[0]).toBe('Order created: SCO-0006');
  });

  it('updates a row with the status returned by the server', () => {
    const updatedOrder: Order = { ...sampleOrders[0], status: 'Baking' };
    const changeStatus = vi.fn(() => of(updatedOrder));
    TestBed.overrideProvider(OrderService, {
      useValue: { getAll: () => of(sampleOrders), changeStatus },
    });
    const app = TestBed.createComponent(App).componentInstance;

    app.changeOrderStatus(sampleOrders[0], 'Baking');

    expect(changeStatus).toHaveBeenCalledWith('1', 'Baking');
    expect(app.orders[0]).toEqual(updatedOrder);
  });

  it('confirms deletion and removes the row only after the server responds', () => {
    const response = new Subject<void>();
    const deleteOrder = vi.fn(() => response);
    TestBed.overrideProvider(OrderService, {
      useValue: { getAll: () => of(sampleOrders), delete: deleteOrder },
    });
    const app = TestBed.createComponent(App).componentInstance;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true);

    app.deleteOrder(sampleOrders[2]);
    expect(confirm).toHaveBeenCalledWith('Delete SCO-0003?');
    expect(deleteOrder).not.toHaveBeenCalled();

    app.deleteOrder(sampleOrders[2]);
    expect(deleteOrder).toHaveBeenCalledWith('3');
    expect(app.orders).toHaveLength(5);

    response.next();
    response.complete();

    expect(app.orders).toHaveLength(4);
    expect(app.orders.some((order) => order.id === '3')).toBe(false);
  });

  it('requires a price for Delivered orders and clears the error after a price is entered', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.orderForm.controls.status.setValue('Delivered');
    app.orderForm.controls.status.markAsTouched();

    expect(app.orderForm.hasError('priceRequired')).toBe(true);

    app.orderForm.controls.price.setValue(1200);
    expect(app.orderForm.hasError('priceRequired')).toBe(false);
  });

  it('associates the delivered-price validation message with its input', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.orderForm.controls.status.setValue('Delivered');
    fixture.componentInstance.orderForm.controls.status.markAsTouched();
    fixture.detectChanges();
    const priceInput = fixture.nativeElement.querySelector('#order-price') as HTMLInputElement;
    const error = fixture.nativeElement.querySelector('#order-price-error') as HTMLElement;

    expect(priceInput.getAttribute('aria-invalid')).toBe('true');
    expect(priceInput.getAttribute('aria-describedby')).toBe('order-price-error');
    expect(error.getAttribute('role')).toBe('alert');
  });

  it('logs a valid customer enquiry and resets the template-driven form', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const enquiryForm = fixture.debugElement.query(By.css('#enquiry-form')).injector.get(NgForm);
    enquiryForm.form.controls['name'].setValue('Meera Joshi');
    enquiryForm.form.controls['email'].setValue('meera@example.com');
    enquiryForm.form.controls['message'].setValue('Can I order a cake?');
    fixture.detectChanges();

    fixture.componentInstance.submitEnquiry(enquiryForm);
    fixture.detectChanges();

    expect(fixture.componentInstance.enquiryThankYou).toContain('Thank you, Meera Joshi');
    expect(enquiryForm.value).toEqual({
      name: null,
      email: null,
      message: null,
    });
    expect(fixture.componentInstance.enquiryName).toBe('');
    expect(fixture.componentInstance.enquiryEmail).toBe('');
    expect(fixture.componentInstance.enquiryMessage).toBe('');
    expect(TestBed.inject(ActivityLogService).getAll()[0]).toBe(
      'Enquiry received from Meera Joshi',
    );
  });

  it('rejects whitespace-only enquiry fields and marks them touched', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const enquiryForm = fixture.debugElement.query(By.css('#enquiry-form')).injector.get(NgForm);
    enquiryForm.form.controls['name'].setValue('   ');
    enquiryForm.form.controls['email'].setValue('meera@example.com');
    enquiryForm.form.controls['message'].setValue('   ');

    expect(enquiryForm.invalid).toBe(true);
    fixture.componentInstance.submitEnquiry(enquiryForm);

    expect(enquiryForm.invalid).toBe(true);
    expect(enquiryForm.form.controls['name'].touched).toBe(true);
    expect(enquiryForm.form.controls['message'].touched).toBe(true);
    expect(fixture.componentInstance.recentActivities).toEqual([]);
  });
});
