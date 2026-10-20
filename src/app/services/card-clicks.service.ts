import { Injectable } from '@angular/core';

@Injectable()
export class CardClicksService {
  private count = 0;

  increment(): void {
    this.count += 1;
  }

  getCount(): number {
    return this.count;
  }
}
