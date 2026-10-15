import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from './highlight';
import { TeamCardComponent } from './team-card/team-card';

export interface TeamMember {
  name: string;
  job: string;
  covers: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TeamCardComponent, HighlightDirective, FormsModule],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class AppComponent {
  team: TeamMember[] = [
    { name: 'Meera Joshi', job: 'Founder and Sales Head', covers: 'Everything' },
    { name: 'Anil Verma', job: 'Sales Rep', covers: 'Northfield' },
    { name: 'Sara Khan', job: 'Sales Rep', covers: 'Southbay' },
    { name: 'Ravi Nair', job: 'Customer Support', covers: 'Complaints from both towns' },
  ];

  selectedMember: TeamMember | null = null;
  favoriteMember: TeamMember | null = null;
  searchTerm = '';

  get filteredMembers(): TeamMember[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.team;
    }

    return this.team.filter((member) => member.name.toLowerCase().includes(term));
  }

  selectMember(member: TeamMember): void {
    this.selectedMember = member;
  }

  setFavorite(member: TeamMember): void {
    this.favoriteMember = member;
  }

  changeSelectedName(): void {
    if (!this.selectedMember) {
      return;
    }

    const previousName = this.selectedMember.name;
    const updatedName = `${previousName} Updated`;

    this.team = this.team.map((member) =>
      member.name === previousName ? { ...member, name: updatedName } : member,
    );

    this.selectedMember = this.team.find((member) => member.name === updatedName) ?? null;
    this.favoriteMember =
      this.favoriteMember && this.favoriteMember.name === previousName
        ? this.selectedMember
        : this.favoriteMember;
  }

  changeSelectedJob(): void {
    if (!this.selectedMember) {
      return;
    }

    const previousName = this.selectedMember.name;
    const nextJob =
      this.selectedMember.job === 'Founder and Sales Head'
        ? 'Growth Lead'
        : this.selectedMember.job === 'Sales Rep'
          ? 'Sales Strategist'
          : this.selectedMember.job === 'Customer Support'
            ? 'Customer Experience Lead'
            : 'Team Lead';

    this.team = this.team.map((member) =>
      member.name === previousName ? { ...member, job: nextJob } : member,
    );

    this.selectedMember = this.team.find((member) => member.name === previousName) ?? null;
    if (this.selectedMember) {
      this.selectedMember = { ...this.selectedMember, job: nextJob };
    }
  }

  getHighlightColor(member: TeamMember): string {
    return member.job === 'Customer Support' ? '#f3e8ff' : '#fff3cd';
  }
}

export class App extends AppComponent {}
