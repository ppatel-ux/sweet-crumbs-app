import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the team board title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Sweet Crumbs team');
  });

  it('contains the four assignment team members', () => {
    const app = TestBed.createComponent(App).componentInstance;

    expect(app.team).toEqual([
      { name: 'Meera Joshi', job: 'Founder and Sales Head', covers: 'Everything' },
      { name: 'Anil Verma', job: 'Sales Rep', covers: 'Northfield' },
      { name: 'Sara Khan', job: 'Sales Rep', covers: 'Southbay' },
      {
        name: 'Ravi Nair',
        job: 'Customer Support',
        covers: 'Complaints from both towns',
      },
    ]);
  });
});
