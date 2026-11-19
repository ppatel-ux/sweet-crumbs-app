import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map, interval, startWith } from 'rxjs';
import { HighlightDirective } from '../highlight';
import { TeamMember } from '../models/team-member';
import { FilterByNamePipe } from '../pipes/filter-by-name.pipe';
import { ActivityLogService } from '../services/activity-log.service';
import { ErrorMessageService } from '../services/error-message.service';
import { LoadingService } from '../services/loading.service';
import { TeamService } from '../services/team.service';
import { TeamCardComponent } from '../team-card/team-card';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [
    TeamCardComponent,
    HighlightDirective,
    FilterByNamePipe,
    AsyncPipe,
    DatePipe,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './team-page.html',
  styleUrl: './page.scss',
})
export class TeamPage {
  private readonly teamService = inject(TeamService);
  private readonly activityLog = inject(ActivityLogService);
  readonly errorMessages = inject(ErrorMessageService);
  readonly loading = inject(LoadingService);
  team = this.teamService.getAll();
  readonly lastUpdated$ = interval(1000).pipe(
    startWith(0),
    map(() => new Date()),
  );
  dateFormat = 'mediumDate';
  readonly dateFormats = [
    { label: 'Short', value: 'shortDate' },
    { label: 'Medium', value: 'mediumDate' },
    { label: 'Long', value: 'longDate' },
  ];
  selectedMember: TeamMember | null = null;
  favoriteMember: TeamMember | null = null;
  searchTerm = '';
  newName = '';

  get recentActivities(): string[] {
    return this.activityLog.getAll().slice(0, 5);
  }

  get canUpdateSelectedMember(): boolean {
    const selectedMember = this.selectedMember;
    if (!selectedMember) {
      return false;
    }

    const searchTerm = this.searchTerm.trim().toLowerCase();
    return this.team.some(
      (member) =>
        member.covers === selectedMember.covers &&
        member.name.toLowerCase().includes(searchTerm),
    );
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.selectedMember = null;
  }

  addTeamMember(): void {
    const number = this.team.length + 1;
    this.team = this.teamService.add({
      name: `New team member ${number}`,
      job: 'Team Member',
      covers: `New teammate ${number}`,
      joinedOn: new Date(),
      monthlyBonus: 0,
      targetAchieved: 0,
      bio: 'A new member of the Sweet Crumbs team.',
    });
  }

  selectMember(member: TeamMember): void {
    this.selectedMember = member;
    this.activityLog.add(`Card selected: ${member.name}`);
  }

  setFavorite(member: TeamMember): void {
    this.favoriteMember = member;
  }

  changeSelectedName(): void {
    const name = this.newName.trim();
    if (!this.canUpdateSelectedMember || !this.selectedMember || !name) {
      return;
    }

    this.updateSelectedMember({ ...this.selectedMember, name });
    this.newName = '';
  }

  changeSelectedJob(): void {
    if (!this.canUpdateSelectedMember || !this.selectedMember) {
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

    this.team = this.teamService.update(currentMember, updatedMember);
    const searchTerm = this.searchTerm.trim().toLowerCase();
    this.selectedMember =
      !searchTerm || updatedMember.name.toLowerCase().includes(searchTerm)
        ? updatedMember
        : null;
    if (this.favoriteMember?.covers === updatedMember.covers) {
      this.favoriteMember = updatedMember;
    }
    this.activityLog.add(`Team member updated: ${updatedMember.name}`);
  }
}
