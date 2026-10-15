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

  it('shows all four team members initially', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-team-card')).toHaveLength(4);
  });

  it('shows the empty state when a search has no matches', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.searchTerm = 'not a teammate';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')?.textContent).toContain(
      'No team members match',
    );
  });

  it('selects a card and marks its favorite without changing selection', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const firstCard = fixture.nativeElement.querySelector('app-team-card') as HTMLElement;
    const cardShell = firstCard.querySelector('app-card-shell') as HTMLElement;

    cardShell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(app.selectedMember?.name).toBe('Meera Joshi');
    expect(firstCard.classList.contains('is-selected')).toBe(true);

    const favoriteButton = firstCard.querySelector('button') as HTMLButtonElement;
    favoriteButton.click();
    fixture.detectChanges();
    expect(app.favoriteMember?.name).toBe('Meera Joshi');
    expect(app.selectedMember?.name).toBe('Meera Joshi');
    expect(favoriteButton.textContent).toContain('Favorited');
  });

  it('updates only the selected member to the name entered by the user', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const originalAnil = app.team[1];
    app.selectMember(app.team[0]);
    app.newName = 'Meera Patel';

    app.changeSelectedName();

    expect(app.team[0].name).toBe('Meera Patel');
    expect(app.selectedMember?.name).toBe('Meera Patel');
    expect(app.team[1]).toBe(originalAnil);
    expect(app.newName).toBe('');
  });

  it('changes the selected job again on a second click', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.selectMember(app.team[1]);

    app.changeSelectedJob();
    expect(app.selectedMember?.job).toBe('Sales Strategist');

    app.changeSelectedJob();
    expect(app.selectedMember?.job).toBe('Regional Sales Lead');
  });

  it('filters team members by name without case sensitivity', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.searchTerm = 'sArA';

    expect(app.filteredMembers.map((member) => member.name)).toEqual(['Sara Khan']);
  });
});
