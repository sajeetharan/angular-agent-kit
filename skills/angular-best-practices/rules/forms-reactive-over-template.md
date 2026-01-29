---
title: Prefer Reactive Forms for Complex Forms
impact: MEDIUM
impactDescription: better validation, testing, and type safety
tags: forms, reactive-forms, validation, typescript
---

## Prefer Reactive Forms for Complex Forms

Use reactive forms with strict typing for complex forms. They provide better type safety, easier testing, and more control over validation.

**Incorrect (template-driven for complex form):**

```typescript
@Component({
  template: `
    <form #userForm="ngForm" (ngSubmit)="onSubmit()">
      <input [(ngModel)]="user.name" name="name" required>
      <input [(ngModel)]="user.email" name="email" required email>
      <div *ngFor="let addr of user.addresses; let i = index">
        <input [(ngModel)]="addr.street" [name]="'street' + i">
        <input [(ngModel)]="addr.city" [name]="'city' + i">
      </div>
      <button type="submit" [disabled]="!userForm.valid">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  user = {
    name: '',
    email: '',
    addresses: [{ street: '', city: '' }]
  };
  
  onSubmit() {
    // No type safety, hard to test validation
  }
}
```

**Correct (strictly typed reactive form):**

```typescript
interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  addresses: FormArray<FormGroup<AddressForm>>;
}

interface AddressForm {
  street: FormControl<string>;
  city: FormControl<string>;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label>Name</label>
        <input formControlName="name">
        @if (form.controls.name.errors?.['required']) {
          <span class="error">Name is required</span>
        }
      </div>
      
      <div>
        <label>Email</label>
        <input formControlName="email" type="email">
        @if (form.controls.email.errors?.['email']) {
          <span class="error">Invalid email</span>
        }
      </div>
      
      <div formArrayName="addresses">
        @for (address of addresses.controls; track $index; let i = $index) {
          <div [formGroupName]="i" class="address-group">
            <input formControlName="street" placeholder="Street">
            <input formControlName="city" placeholder="City">
            <button type="button" (click)="removeAddress(i)">Remove</button>
          </div>
        }
      </div>
      
      <button type="button" (click)="addAddress()">Add Address</button>
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {
  private fb = inject(NonNullableFormBuilder);
  
  form = this.fb.group<UserForm>({
    name: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    addresses: this.fb.array<FormGroup<AddressForm>>([])
  });
  
  get addresses() {
    return this.form.controls.addresses;
  }
  
  addAddress() {
    const addressGroup = this.fb.group<AddressForm>({
      street: this.fb.control('', Validators.required),
      city: this.fb.control('', Validators.required)
    });
    this.addresses.push(addressGroup);
  }
  
  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }
  
  onSubmit() {
    if (this.form.valid) {
      // Fully typed value
      const value = this.form.getRawValue();
      console.log(value.name); // string
      console.log(value.addresses[0]?.city); // string | undefined
    }
  }
}
```

**Custom validators with type safety:**

```typescript
// validators.ts
export function matchValidator(
  controlName: string, 
  matchingControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);
    
    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  };
}

// Usage
form = this.fb.group({
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required]
}, {
  validators: matchValidator('password', 'confirmPassword')
});
```

Reference: [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
