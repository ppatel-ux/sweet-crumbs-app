import { Injectable } from '@angular/core';
import { TeamMember } from '../models/team-member';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private team: TeamMember[] = [
    { name: 'Meera Joshi', job: 'Founder and Sales Head', covers: 'Everything' },
    { name: 'Anil Verma', job: 'Sales Rep', covers: 'Northfield' },
    { name: 'Sara Khan', job: 'Sales Rep', covers: 'Southbay' },
    { name: 'Ravi Nair', job: 'Customer Support', covers: 'Complaints from both towns' },
  ];

  getAll(): TeamMember[] {
    return this.team;
  }

  update(currentMember: TeamMember, updatedMember: TeamMember): void {
    const index = this.team.findIndex((member) => member.covers === currentMember.covers);
    if (index === -1) {
      throw new Error(`Team member "${currentMember.name}" could not be found.`);
    }

    this.team[index] = updatedMember;
  }
}
