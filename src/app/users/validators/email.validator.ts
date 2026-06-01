import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { User } from '../models/user.model';

export const trimValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (typeof control.value === 'string' && control.value !== control.value.trim()) {
    control.setValue(control.value.trim(), { emitEvent: false });
  }
  return null;
};

export function uniqueEmailValidator(
  getUsers: () => User[],
  excludeId?: () => number | null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim().toLowerCase();
    if (!value) return null;

    const taken = getUsers().some(
      u =>
        u.email.toLowerCase() === value &&
        u.id !== excludeId?.()
    );

    return taken ? { emailTaken: true } : null;
  };
}