import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { App } from './app';
import { APP_CONFIG } from './app-config';
import { ActivityLogService } from './services/activity-log.service';

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
      ],
    }).compileComponents();
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

  it('renders every sample order and marks the two big orders', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('.orders-table tbody tr');

    expect(rows).toHaveLength(5);
    expect(fixture.nativeElement.querySelectorAll('.big-order-badge')).toHaveLength(2);
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

  it('adds a valid order immediately and resets the order form to its defaults', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.orderForm.setValue({
      accountName: 'New Customer',
      flavour: 'Vanilla',
      sizeKg: 0.5,
      deliveryDate: futureDeliveryDate(),
      deliveryTown: 'Southbay',
      status: 'New',
      price: null,
    });

    app.submitOrder();

    expect(app.orders).toHaveLength(6);
    expect(app.orders[5]).toMatchObject({
      orderNumber: 'SCO-0006',
      accountName: 'New Customer',
      bigOrder: false,
    });
    expect(app.orderForm.getRawValue()).toEqual({
      accountName: '',
      flavour: '',
      sizeKg: null,
      deliveryDate: '',
      deliveryTown: '',
      status: 'New',
      price: null,
    });
    expect(app.recentActivities[0]).toBe('Order SCO-0006 added');
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
    const enquiryForm = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
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
    const enquiryForm = fixture.debugElement.query(By.directive(NgForm)).injector.get(NgForm);
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
