import { InjectionToken } from '@angular/core';

export interface AppConfig {
  minSizeKg: number;
  maxSizeKg: number;
  bigOrderKg: number;
  apiBaseUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
