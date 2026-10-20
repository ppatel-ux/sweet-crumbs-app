import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from './highlight';
import { TeamCardComponent } from './team-card/team-card';
import { TeamMember } from './models/team-member';
import { TeamService } from './services/team.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TeamCardComponent, HighlightDirective, FormsModule],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class AppComponent {
  private readonly teamService = inject(TeamService);
  team = this.teamService.getAll();

  selectedMember: TeamMember | null = null;
  favoriteMember: TeamMember | null = null;
  searchTerm = '';
  newName = '';

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
    const name = this.newName.trim();
    if (!this.selectedMember || !name) {
      return;
    }

    this.updateSelectedMember({ ...this.selectedMember, name });
    this.newName = '';
  }

  changeSelectedJob(): void {
    if (!this.selectedMember) {
      return;
    }

    const jobOptions =
      this.selectedMember.covers === 'Everything'
        ? ['Founder and Sales Head', 'Growth Lead', 'Operations Lead']
        : this.selectedMember.covers === 'Complaints from both towns'
          ? ['Customer Support', 'Customer Experience Lead', 'Support Manager']
          : ['Sales Rep', 'Sales Strategist', 'Regional Sales Lead'];
    const currentIndex = jobOptions.indexOf(this.selectedMember.job);
    const nextJob = jobOptions[(currentIndex + 1) % jobOptions.length];

    this.updateSelectedMember({ ...this.selectedMember, job: nextJob });
  }

  getHighlightColor(member: TeamMember): string {
    return member.job === 'Customer Support' ? '#f3e8ff' : '#fff3cd';
  }

  private updateSelectedMember(updatedMember: TeamMember): void {
    const currentMember = this.selectedMember;
    if (!currentMember) {
      return;
    }

    this.teamService.update(currentMember, updatedMember);

    this.selectedMember = updatedMember;
    if (this.favoriteMember?.covers === updatedMember.covers) {
      this.favoriteMember = updatedMember;
    }
  }
}

export class App extends AppComponent {}
