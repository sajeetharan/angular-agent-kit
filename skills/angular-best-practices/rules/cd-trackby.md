---
title: Always Use trackBy in *ngFor
impact: CRITICAL
impactDescription: prevents DOM destruction/recreation, 5-50x faster list updates
tags: change-detection, trackby, ngfor, performance, lists
---

## Always Use trackBy in *ngFor

Always provide a `trackBy` function when using `*ngFor` (or `@for`). Without trackBy, Angular destroys and recreates DOM elements when the array reference changes, even if the actual items are identical.

**Incorrect (no trackBy - destroys all DOM nodes on array change):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users">
      <app-user-card [user]="user"></app-user-card>
    </div>
  `
})
export class UserListComponent {
  users: User[] = [];
  
  refresh() {
    // All DOM nodes destroyed and recreated!
    this.users = this.userService.getUsers();
  }
}
```

**Correct (with trackBy - only updates changed items):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngFor="let user of users; trackBy: trackByUserId">
      <app-user-card [user]="user"></app-user-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users: User[] = [];
  
  trackByUserId(index: number, user: User): string {
    return user.id;
  }
  
  refresh() {
    // Only changed items are updated in DOM
    this.users = this.userService.getUsers();
  }
}
```

**With new @for control flow (Angular 17+):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    @for (user of users; track user.id) {
      <app-user-card [user]="user" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users: User[] = [];
}
```

**trackBy function guidelines:**
- Return a unique, stable identifier (usually `id` property)
- Avoid returning the index unless items never reorder
- Keep the function simple and fast

```typescript
// Good - unique stable ID
trackByUserId = (index: number, user: User) => user.id;

// Good - composite key for nested data
trackByOrderItem = (index: number, item: OrderItem) => 
  `${item.orderId}-${item.productId}`;

// Bad - index changes when items reorder
trackByIndex = (index: number) => index;

// Bad - object reference changes on updates
trackByObject = (index: number, user: User) => user;
```

Reference: [Angular *ngFor trackBy](https://angular.dev/api/common/NgFor)
