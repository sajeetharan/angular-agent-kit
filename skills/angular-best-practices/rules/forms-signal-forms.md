---
title: Use Signal Forms for New Angular v21+ Apps
impact: HIGH
impactDescription: Type-safe, signal-based forms with built-in validation - replaces reactive forms boilerplate
tags: forms, signals, signal-forms, validation, v21
---

## Use Signal Forms for New Angular v21+ Apps

For Angular v21+ projects, prefer Signal Forms over reactive forms. They provide type-safe, signal-based form state management with less boilerplate.

**When to use which:**
- **Signal Forms**: New apps on Angular v21+ (preferred)
- **Reactive Forms**: Existing apps or pre-v21 projects
- **Template-driven**: Simple forms with minimal validation

**Incorrect (reactive forms boilerplate):**

```typescript
@Component({...})
export class UserFormComponent {
  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    age: new FormControl<number | null>(null, [Validators.min(18)])
  });
}
```

**Correct (Signal Forms):**

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField, required, email, min } from '@angular/forms/signals';

@Component({
  imports: [FormField],
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [formField]="userForm.controls.name" />
      <input [formField]="userForm.controls.email" />
      <input [formField]="userForm.controls.age" type="number" />
    </form>
  `
})
export class UserFormComponent {
  // CRITICAL: Never use null or undefined as initial values
  userModel = signal({
    name: '',      // Use '' not null
    email: '',
    age: 0,        // Use 0 not null
    hobbies: [] as string[]  // Use [] not null
  });

  userForm = form(this.userModel, (path) => {
    required(path.name, { message: 'Name is required' });
    email(path.email, { message: 'Invalid email' });
    min(path.age, 18);
  });

  onSubmit() {
    if (this.userForm.valid()) {
      console.log(this.userModel());
    }
  }
}
```

### Available Validators

Import from `@angular/forms/signals`:
- `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`

### Conditional Validation

```typescript
required(path.name, {
  when({ valueOf }) {
    return valueOf(path.age) > 10;
  }
});
```

### Schema Helpers

- `applyWhen` — apply rules conditionally to a group
- `applyEach` — apply rules to each item in an array
- `disabled`, `hidden`, `readonly` — field state rules
- `validate`, `validateHttp` — custom validation
