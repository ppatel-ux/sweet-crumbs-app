import { TestBed } from '@angular/core/testing';
import { TeamCardComponent } from '../team-card/team-card';

describe('CardClicksService provider scope', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamCardComponent],
    }).compileComponents();
  });

  it('keeps a separate click count for each card', () => {
    const first = TestBed.createComponent(TeamCardComponent);
    const second = TestBed.createComponent(TeamCardComponent);
    first.componentRef.setInput('member', {
      name: 'Meera Joshi',
      job: 'Founder and Sales Head',
      covers: 'Everything',
    });
    second.componentRef.setInput('member', {
      name: 'Anil Verma',
      job: 'Sales Rep',
      covers: 'Northfield',
    });
    first.detectChanges();
    second.detectChanges();

    first.nativeElement
      .querySelector('.team-card-shell')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    first.detectChanges();

    expect(first.nativeElement.textContent).toContain('Clicks: 1');
    expect(second.nativeElement.textContent).toContain('Clicks: 0');
  });
});
