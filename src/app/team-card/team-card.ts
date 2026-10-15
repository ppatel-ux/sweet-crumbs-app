import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CardShellComponent } from '../card-shell/card-shell';
import { TeamMember } from '../app';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [NgTemplateOutlet, CardShellComponent],
  styleUrl: './team-card.scss',
  templateUrl: './team-card.html',
})
export class TeamCardComponent implements OnInit, OnChanges {
  @Input() member!: TeamMember;
  @Input() isSelected = false;
  @Input() isFavorite = false;
  @Input() highlightColor = '#fff3cd';

  @Output() favoriteSelected = new EventEmitter<TeamMember>();
  @Output() cardSelected = new EventEmitter<TeamMember>();

  ngOnInit(): void {
    console.log('TeamCard ngOnInit:', this.member);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('TeamCard ngOnChanges:', changes);
  }

  selectCard(): void {
    this.cardSelected.emit(this.member);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteSelected.emit(this.member);
  }
}
