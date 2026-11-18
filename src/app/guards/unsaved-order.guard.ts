import { CanDeactivateFn } from '@angular/router';
import { HasUnsavedChanges } from '../models/has-unsaved-changes';

export const unsavedOrderGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() ||
  window.confirm('You have an unsaved order. Leave this page?');
