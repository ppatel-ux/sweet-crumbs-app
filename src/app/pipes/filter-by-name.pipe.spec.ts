import { TestBed } from '@angular/core/testing';
import { TeamService } from '../services/team.service';
import { FilterByNamePipe } from './filter-by-name.pipe';

describe('FilterByNamePipe', () => {
  it('returns all team members when the search term is empty', () => {
    const team = TestBed.inject(TeamService).getAll();
    const pipe = new FilterByNamePipe();

    expect(pipe.transform(team, ' ')).toBe(team);
  });

  it('matches names without case sensitivity', () => {
    const team = TestBed.inject(TeamService).getAll();
    const pipe = new FilterByNamePipe();

    expect(pipe.transform(team, 'sArA')).toEqual([team[2]]);
  });

  it('returns an empty array when there are no matches', () => {
    const team = TestBed.inject(TeamService).getAll();
    const pipe = new FilterByNamePipe();

    expect(pipe.transform(team, 'not a teammate')).toEqual([]);
  });
});
