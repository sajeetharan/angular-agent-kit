---
title: Use New Control Flow Syntax (@if, @for, @switch)
impact: HIGH
impactDescription: better performance, cleaner syntax, type narrowing
tags: template, control-flow, angular-17, performance
---

## Use New Control Flow Syntax (@if, @for, @switch)

Use Angular 17+ built-in control flow (`@if`, `@for`, `@switch`) instead of structural directives. It's faster, cleaner, and provides better type narrowing.

**Incorrect (old structural directive syntax):**

```html
<!-- Old ngIf -->
<div *ngIf="user; else loading">
  {{ user.name }}
</div>
<ng-template #loading>
  <span>Loading...</span>
</ng-template>

<!-- Old ngFor -->
<div *ngFor="let item of items; let i = index; trackBy: trackByFn">
  {{ i }}: {{ item.name }}
</div>

<!-- Old ngSwitch -->
<div [ngSwitch]="status">
  <span *ngSwitchCase="'active'">Active</span>
  <span *ngSwitchCase="'pending'">Pending</span>
  <span *ngSwitchDefault>Unknown</span>
</div>
```

**Correct (new control flow syntax):**

```html
<!-- @if with @else -->
@if (user) {
  <div>{{ user.name }}</div>
} @else {
  <span>Loading...</span>
}

<!-- @if with @else if -->
@if (status === 'loading') {
  <app-spinner />
} @else if (status === 'error') {
  <app-error [message]="errorMessage" />
} @else {
  <app-content [data]="data" />
}

<!-- @for with track -->
@for (item of items; track item.id; let i = $index) {
  <div>{{ i }}: {{ item.name }}</div>
} @empty {
  <p>No items found</p>
}

<!-- @switch -->
@switch (status) {
  @case ('active') {
    <span class="badge-active">Active</span>
  }
  @case ('pending') {
    <span class="badge-pending">Pending</span>
  }
  @default {
    <span class="badge-unknown">Unknown</span>
  }
}
```

**@for loop variables:**

```html
@for (item of items; track item.id) {
  <div>
    <!-- Built-in loop variables -->
    Index: {{ $index }}
    First: {{ $first }}
    Last: {{ $last }}
    Even: {{ $even }}
    Odd: {{ $odd }}
    Count: {{ $count }}
  </div>
}

<!-- Using variables for styling -->
@for (item of items; track item.id; let idx = $index) {
  <div 
    [class.first]="$first" 
    [class.last]="$last"
    [class.striped]="$even">
    {{ idx + 1 }}. {{ item.name }}
  </div>
}
```

**track is required - choose wisely:**

```html
<!-- Track by unique identifier (best) -->
@for (user of users; track user.id) {
  <app-user-card [user]="user" />
}

<!-- Track by index (only if items never reorder) -->
@for (item of staticItems; track $index) {
  <span>{{ item }}</span>
}

<!-- Track by composite key -->
@for (item of orderItems; track item.orderId + '-' + item.productId) {
  <app-line-item [item]="item" />
}
```

**Type narrowing benefits:**

```typescript
interface User {
  id: string;
  name: string;
  email?: string;
}

// Template
@if (user.email) {
  <!-- TypeScript knows email is defined here -->
  <a href="mailto:{{ user.email }}">{{ user.email }}</a>
}
```

**Migration from structural directives:**

```bash
# Automatic migration
ng generate @angular/core:control-flow
```

Reference: [Angular Control Flow](https://angular.dev/guide/templates/control-flow)
