import { Injectable, signal } from '@angular/core';

export type AuthRole = 'staff' | 'owner';

export interface AuthUser {
  role: AuthRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<AuthUser | null>(null);
  readonly currentUser = this.user.asReadonly();

  login(role: AuthRole): void {
    this.user.set({ role });
  }

  logout(): void {
    this.user.set(null);
  }
}
