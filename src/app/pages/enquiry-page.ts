import { Component, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivityLogService } from '../services/activity-log.service';
import { ErrorMessageService } from '../services/error-message.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-enquiry-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './enquiry-page.html',
  styleUrl: './page.scss',
})
export class EnquiryPage {
  private readonly activityLog = inject(ActivityLogService);
  readonly errorMessages = inject(ErrorMessageService);
  readonly loading = inject(LoadingService);
  enquiryThankYou = '';
  enquiryName = '';
  enquiryEmail = '';
  enquiryMessage = '';

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
}
