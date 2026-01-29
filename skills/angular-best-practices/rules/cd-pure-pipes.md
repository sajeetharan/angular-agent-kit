---
title: Prefer Pure Pipes Over Methods in Templates
impact: CRITICAL
impactDescription: method calls run every change detection cycle, pipes are memoized
tags: change-detection, pipes, pure-pipes, performance, templates
---

## Prefer Pure Pipes Over Methods in Templates

Never call methods directly in templates for data transformation. Methods execute on every change detection cycle, while pure pipes only recalculate when their input changes.

**Incorrect (method call - runs every change detection cycle):**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user">
      <h2>{{ getFullName() }}</h2>
      <p>{{ formatDate(user.createdAt) }}</p>
      <span>{{ calculateAge(user.birthDate) }} years old</span>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;
  
  getFullName(): string {
    console.log('getFullName called'); // Called 100s of times!
    return `${this.user.firstName} ${this.user.lastName}`;
  }
  
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US').format(date);
  }
  
  calculateAge(birthDate: Date): number {
    // Complex calculation runs every cycle
    return Math.floor((Date.now() - birthDate.getTime()) / 31536000000);
  }
}
```

**Correct (pure pipes - only recalculate when input changes):**

```typescript
// full-name.pipe.ts
@Pipe({
  name: 'fullName',
  pure: true, // default, but explicit is better
  standalone: true
})
export class FullNamePipe implements PipeTransform {
  transform(user: { firstName: string; lastName: string }): string {
    return `${user.firstName} ${user.lastName}`;
  }
}

// age.pipe.ts
@Pipe({
  name: 'age',
  pure: true,
  standalone: true
})
export class AgePipe implements PipeTransform {
  transform(birthDate: Date): number {
    return Math.floor((Date.now() - birthDate.getTime()) / 31536000000);
  }
}

// Component using pipes
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [FullNamePipe, AgePipe, DatePipe],
  template: `
    <div class="user">
      <h2>{{ user | fullName }}</h2>
      <p>{{ user.createdAt | date:'mediumDate' }}</p>
      <span>{{ user.birthDate | age }} years old</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  @Input() user!: User;
}
```

**For computed values that don't need a pipe, use getters with signals:**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <h2>{{ fullName() }}</h2>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  user = input.required<User>();
  
  // Computed signal - only recalculates when user changes
  fullName = computed(() => 
    `${this.user().firstName} ${this.user().lastName}`
  );
}
```

**When to use impure pipes:**
- Only when you intentionally want the pipe to run every cycle
- For pipes that depend on external state (rarely needed)
- Always document why an impure pipe is necessary

Reference: [Angular Pipes Guide](https://angular.dev/guide/pipes)
