import { Injectable } from '@angular/core';
import { TeamMember } from '../models/team-member';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private team: TeamMember[] = [
    {
      name: 'Meera Joshi',
      job: 'Founder and Sales Head',
      covers: 'Everything',
      joinedOn: new Date(2019, 3, 15),
      monthlyBonus: 25000.5,
      targetAchieved: 0.92,
      bio: 'Started Sweet Crumbs in 2019 and still tastes every new recipe before it reaches the shelves.',
    },
    {
      name: 'Anil Verma',
      job: 'Sales Rep',
      covers: 'Northfield',
      joinedOn: new Date(2022, 7, 1),
      monthlyBonus: 12500,
      targetAchieved: 0.78,
      bio: 'Looks after every bakery and cafe in Northfield and never forgets a standing order.',
    },
    {
      name: 'Sara Khan',
      job: 'Sales Rep',
      covers: 'Southbay',
      joinedOn: new Date(2023, 1, 20),
      monthlyBonus: 15750.75,
      targetAchieved: 1.05,
      bio: 'Opened the Southbay market and loves a tough negotiation over a bulk cake order.',
    },
    {
      name: 'Ravi Nair',
      job: 'Customer Support',
      covers: 'Complaints from both towns',
      joinedOn: new Date(2024, 5, 10),
      monthlyBonus: 8200.25,
      targetAchieved: 0.86,
      bio: 'Turns upset customers into regulars, one resolved complaint at a time.',
    },
  ];

  getAll(): TeamMember[] {
    return this.team;
  }

  add(member: TeamMember): TeamMember[] {
    this.team = [...this.team, member];
    return this.team;
  }

  update(currentMember: TeamMember, updatedMember: TeamMember): TeamMember[] {
    const index = this.team.findIndex((member) => member.covers === currentMember.covers);
    if (index === -1) {
      throw new Error(`Team member "${currentMember.name}" could not be found.`);
    }

    this.team = this.team.map((member, memberIndex) =>
      memberIndex === index ? updatedMember : member,
    );
    return this.team;
  }
}
