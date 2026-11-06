import { Pipe, PipeTransform } from '@angular/core';
import { TeamMember } from '../models/team-member';

@Pipe({
  name: 'filterByName',
  standalone: true,
})
export class FilterByNamePipe implements PipeTransform {
  transform(team: TeamMember[], searchTerm: string): TeamMember[] {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return team;
    }

    return team.filter((member) => member.name.toLowerCase().includes(term));
  }
}
