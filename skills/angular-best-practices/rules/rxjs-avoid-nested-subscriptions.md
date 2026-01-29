---
title: Never Nest Subscriptions
impact: HIGH
impactDescription: causes memory leaks, race conditions, hard to maintain
tags: rxjs, subscriptions, operators, memory-leaks
---

## Never Nest Subscriptions

Never subscribe inside another subscription. Use RxJS operators like `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap` to handle dependent async operations.

**Incorrect (nested subscriptions - memory leaks, race conditions):**

```typescript
@Component({...})
export class UserOrdersComponent implements OnInit {
  user: User | null = null;
  orders: Order[] = [];
  
  ngOnInit() {
    // Nested subscription - BAD!
    this.userService.getCurrentUser().subscribe(user => {
      this.user = user;
      
      // Inner subscription - memory leak risk!
      this.orderService.getOrdersByUser(user.id).subscribe(orders => {
        this.orders = orders;
        
        // Even deeper nesting - callback hell!
        orders.forEach(order => {
          this.orderService.getOrderDetails(order.id).subscribe(details => {
            order.details = details;
          });
        });
      });
    });
  }
}
```

**Correct (flattening operators):**

```typescript
@Component({
  template: `
    @if (vm$ | async; as vm) {
      <h1>{{ vm.user.name }}'s Orders</h1>
      @for (order of vm.orders; track order.id) {
        <app-order-card [order]="order" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserOrdersComponent {
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  
  vm$ = this.userService.getCurrentUser().pipe(
    switchMap(user => this.orderService.getOrdersByUser(user.id).pipe(
      map(orders => ({ user, orders }))
    ))
  );
}
```

**Choose the right flattening operator:**

```typescript
// switchMap - Cancel previous, use latest (most common)
// Use for: search, navigation, latest value scenarios
searchResults$ = this.searchTerm$.pipe(
  debounceTime(300),
  switchMap(term => this.searchService.search(term))
);

// mergeMap - Run all in parallel
// Use for: batch operations where order doesn't matter
deleteResults$ = this.idsToDelete$.pipe(
  mergeMap(id => this.service.delete(id))
);

// concatMap - Run sequentially, preserve order
// Use for: operations that must happen in sequence
uploadResults$ = this.files$.pipe(
  concatMap(file => this.uploadService.upload(file))
);

// exhaustMap - Ignore new until current completes
// Use for: preventing double-submits
submitResult$ = this.submitClick$.pipe(
  exhaustMap(() => this.formService.submit(this.form.value))
);
```

**Loading multiple related entities:**

```typescript
@Component({...})
export class DashboardComponent {
  vm$ = this.userService.getCurrentUser().pipe(
    switchMap(user => forkJoin({
      user: of(user),
      orders: this.orderService.getOrders(user.id),
      notifications: this.notificationService.getNotifications(user.id),
      preferences: this.preferencesService.getPreferences(user.id)
    }))
  );
}
```

**With error handling:**

```typescript
vm$ = this.userService.getCurrentUser().pipe(
  switchMap(user => 
    this.orderService.getOrdersByUser(user.id).pipe(
      map(orders => ({ status: 'success' as const, user, orders })),
      catchError(error => of({ 
        status: 'error' as const, 
        user, 
        orders: [], 
        error: error.message 
      }))
    )
  ),
  startWith({ status: 'loading' as const, user: null, orders: [] })
);
```

Reference: [RxJS Flattening Operators](https://rxjs.dev/guide/operators)
