import { FormControl, FormGroup } from '@angular/forms';
import { noPastDate, nonBlank, priceNeededToDeliver } from './order.validators';

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('order validators', () => {
  it('rejects past and invalid calendar dates, but permits today and future dates', () => {
    expect(noPastDate(new FormControl('2000-01-01'))).toEqual({ pastDate: true });
    expect(noPastDate(new FormControl('2026-02-30'))).toEqual({ invalidDate: true });
    expect(noPastDate(new FormControl('not-a-date'))).toEqual({ invalidDate: true });
    expect(noPastDate(new FormControl(localDateString(new Date())))).toBeNull();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(noPastDate(new FormControl(localDateString(tomorrow)))).toBeNull();
  });

  it('leaves empty dates to the required validator', () => {
    expect(noPastDate(new FormControl(''))).toBeNull();
    expect(noPastDate(new FormControl(null))).toBeNull();
  });

  it('rejects whitespace-only text while allowing nonblank text', () => {
    expect(nonBlank(new FormControl('   '))).toEqual({ nonBlank: true });
    expect(nonBlank(new FormControl(' Sweet Crumbs '))).toBeNull();
    expect(nonBlank(new FormControl(''))).toEqual({ nonBlank: true });
  });

  it('requires a price only for Delivered orders when the price is empty', () => {
    const form = new FormGroup({
      status: new FormControl('Delivered'),
      price: new FormControl(null as number | null),
    });

    expect(priceNeededToDeliver(form)).toEqual({ priceRequired: true });

    form.controls.price.setValue(0);
    expect(priceNeededToDeliver(form)).toBeNull();

    form.controls.price.setValue(null);
    form.controls.status.setValue('New');
    expect(priceNeededToDeliver(form)).toBeNull();
  });
});
