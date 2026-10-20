import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CardShellComponent } from '../card-shell/card-shell';
import { TeamMember } from '../models/team-member';
import { ActivityLogService } from '../services/activity-log.service';
import { CardClicksService } from '../services/card-clicks.service';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [NgTemplateOutlet, CardShellComponent],
  // Each card's injector owns its counter; without this, a root-provided counter would be shared.
  providers: [CardClicksService],
  styleUrl: './team-card.scss',
  templateUrl: './team-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamCardComponent implements OnInit, OnChanges {
  private readonly activityLog = inject(ActivityLogService);
  private readonly cardClicks = inject(CardClicksService);

  @Input() member!: TeamMember;
  @Input() isSelected = false;
  @Input() isFavorite = false;
  @Input() highlightColor = '#fff3cd';

  @Output() favoriteSelected = new EventEmitter<TeamMember>();
  @Output() cardSelected = new EventEmitter<TeamMember>();

  get clickCount(): number {
    return this.cardClicks.getCount();
  }

  ngOnInit(): void {
    console.log('TeamCard ngOnInit:', this.member);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('TeamCard ngOnChanges:', changes);
  }

  selectCard(): void {
    this.cardClicks.increment();
    this.cardSelected.emit(this.member);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.cardClicks.increment();
    this.activityLog.add(`Favorite chosen: ${this.member.name}`);
    this.favoriteSelected.emit(this.member);
  }
}
