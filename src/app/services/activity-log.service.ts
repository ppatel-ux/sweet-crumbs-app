import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly messages: string[] = [];

  constructor() {
    const id = Math.random().toString(36).slice(2, 10) || Date.now().toString(36);
    console.log(`ActivityLogService created: ${id}`);
  }

  add(message: string): void {
    const entry = message.trim();
    if (!entry) {
      throw new Error('Activity messages cannot be empty.');
    }

    this.messages.unshift(entry);
  }

  getAll(): string[] {
    return [...this.messages];
  }
}
