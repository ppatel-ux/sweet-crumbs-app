import { TestBed } from '@angular/core/testing';
import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamService);
  });

  it('provides the four team members', () => {
    expect(service.getAll()).toHaveLength(4);
  });

  it('replaces only the requested member', () => {
    const team = service.getAll();
    const meera = team[0];
    const anil = team[1];
    const updatedMeera = { ...meera, name: 'Meera Updated' };

    service.update(meera, updatedMeera);

    expect(team[0]).toBe(updatedMeera);
    expect(team[1]).toBe(anil);
  });
});
