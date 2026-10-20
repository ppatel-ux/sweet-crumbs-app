import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { APP_CONFIG } from './app-config';

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
    })
      .compileComponents();
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
});
