---
title: Use OnPush Change Detection Strategy
impact: CRITICAL
impactDescription: 2-10x performance improvement in complex apps
tags: change-detection, onpush, performance, optimization
---

## Use OnPush Change Detection Strategy

Use `ChangeDetectionStrategy.OnPush` for components to dramatically reduce change detection cycles. With OnPush, Angular only checks the component when its inputs change, an event originates from the component, or you explicitly trigger detection.

**Incorrect (default change detection - checks every cycle):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.email }}
    </div>
  `
})
export class UserListComponent {
  @Input() users: User[] = [];
}
```

This component re-renders on every change detection cycle, even if `users` hasn't changed.

**Correct (OnPush - only checks when inputs change):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.email }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() users: User[] = [];
}
```

**For standalone components:**

```typescript
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgFor],
  template: `
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.email }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users = input<User[]>([]);
}
```

**When OnPush checks the component:**
1. An `@Input()` reference changes (not mutation!)
2. An event originates from the component or its children
3. You manually call `markForCheck()` or `detectChanges()`
4. An async pipe emits a new value

**Important:** With OnPush, you must use immutable data patterns. Mutating an array won't trigger change detection:

```typescript
// Won't trigger change detection with OnPush
this.users.push(newUser);

// Will trigger change detection
this.users = [...this.users, newUser];
```

Reference: [Angular Change Detection Guide](https://angular.dev/best-practices/skipping-subtrees)
