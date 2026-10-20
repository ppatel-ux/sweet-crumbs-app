import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { ActivityLogService } from './services/activity-log.service';
import { HighlightDirective } from './highlight';
import { TeamCardComponent } from './team-card/team-card';
import {
  DELIVERY_TOWNS,
  FLAVOURS,
  NewOrder,
  Order,
  OrderStatus,
  ORDER_STATUSES,
} from './models/order';
import { TeamMember } from './models/team-member';
import { OrderService } from './services/order.service';
import { TeamService } from './services/team.service';
import { noPastDate, nonBlank, priceNeededToDeliver } from './validators/order.validators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TeamCardComponent, HighlightDirective, FormsModule, ReactiveFormsModule],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class AppComponent {
  readonly config = inject(APP_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teamService = inject(TeamService);
  private readonly orderService = inject(OrderService);
  private readonly activityLog = inject(ActivityLogService);
  team = this.teamService.getAll();
  orders: Order[] = this.orderService.getAll();
  readonly flavours = FLAVOURS;
  readonly deliveryTowns = DELIVERY_TOWNS;
  readonly orderStatuses = ORDER_STATUSES;
  enquiryThankYou = '';
  enquiryName = '';
  enquiryEmail = '';
  enquiryMessage = '';
  isBigOrder = false;
  readonly orderForm = new FormGroup(
    {
      accountName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), nonBlank],
      }),
      flavour: new FormControl<(typeof FLAVOURS)[number] | ''>('', Validators.required),
      sizeKg: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(this.config.minSizeKg),
        Validators.max(this.config.maxSizeKg),
      ]),
      deliveryDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, noPastDate],
      }),
      deliveryTown: new FormControl<(typeof DELIVERY_TOWNS)[number] | ''>('', Validators.required),
      status: new FormControl<OrderStatus>('New', { nonNullable: true }),
      price: new FormControl<number | null>(null),
    },
    { validators: priceNeededToDeliver },
  );

  constructor() {
    this.orderForm.controls.sizeKg.valueChanges
      .pipe(startWith(this.orderForm.controls.sizeKg.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((sizeKg) => {
        this.isBigOrder = sizeKg !== null && sizeKg >= this.config.bigOrderKg;
      });
  }

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

  get recentActivities(): string[] {
    return this.activityLog.getAll().slice(0, 5);
  }

  submitEnquiry(form: NgForm): void {
    const name = String(form.value.name ?? '').trim();
    const email = String(form.value.email ?? '').trim();
    const message = String(form.value.message ?? '').trim();
    form.controls['name']?.setValue(name);
    form.controls['email']?.setValue(email);
    form.controls['message']?.setValue(message);
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.activityLog.add(`Enquiry received from ${name}`);
    this.enquiryThankYou = `Thank you, ${name}. Your enquiry has been received.`;
    form.resetForm();
    this.enquiryName = '';
    this.enquiryEmail = '';
    this.enquiryMessage = '';
  }

  showEnquiryError(control: NgModel): boolean {
    return control.touched === true && control.invalid === true;
  }

  submitOrder(): void {
    this.orderForm.controls.accountName.setValue(this.orderForm.controls.accountName.value.trim());
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const values = this.orderForm.getRawValue();
    if (!values.flavour || !values.deliveryTown || values.sizeKg === null) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const order: NewOrder = {
      accountName: values.accountName.trim(),
      flavour: values.flavour,
      sizeKg: values.sizeKg,
      deliveryDate: values.deliveryDate,
      deliveryTown: values.deliveryTown,
      status: values.status,
      ...(values.price !== null ? { price: values.price } : {}),
    };
    this.orderService.add(order);
    this.orders = this.orderService.getAll();
    this.orderForm.reset({
      accountName: '',
      flavour: '',
      sizeKg: null,
      deliveryDate: '',
      deliveryTown: '',
      status: 'New',
      price: null,
    });
  }

  showOrderError(controlName: keyof typeof this.orderForm.controls): boolean {
    const control = this.orderForm.controls[controlName];
    return control.touched && control.invalid;
  }

  showPriceRequiredError(): boolean {
    return (
      this.orderForm.hasError('priceRequired') &&
      (this.orderForm.controls.status.touched || this.orderForm.controls.price.touched)
    );
  }

  orderErrorMessage(controlName: keyof typeof this.orderForm.controls): string {
    const control = this.orderForm.controls[controlName];
    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('nonBlank')) {
      return 'Enter a customer name.';
    }
    if (control.hasError('minlength')) {
      return 'Enter at least 3 characters.';
    }
    if (control.hasError('min') || control.hasError('max')) {
      return `Size must be between ${this.config.minSizeKg} and ${this.config.maxSizeKg} kg.`;
    }
    if (control.hasError('pastDate')) {
      return "Delivery date can't be in the past.";
    }
    if (control.hasError('invalidDate')) {
      return 'Enter a valid delivery date.';
    }
    return 'Check this value.';
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
    this.activityLog.add(`Team member updated: ${updatedMember.name}`);
  }
}

export class App extends AppComponent {}
