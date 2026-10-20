import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { OrderStatus } from '../models/order';

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export const noPastDate: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: unknown = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string' || !isCalendarDate(value)) {
    return { invalidDate: true };
  }

  return value < localDateString(new Date()) ? { pastDate: true } : null;
};

export const nonBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length === 0
    ? { nonBlank: true }
    : null;

export const priceNeededToDeliver: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const status: OrderStatus | undefined = control.get('status')?.value;
  const price: unknown = control.get('price')?.value;
  return status === 'Delivered' && (price === null || price === undefined || price === '')
    ? { priceRequired: true }
    : null;
};
