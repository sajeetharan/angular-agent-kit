---
title: Use Async Pipe Instead of Manual Subscriptions
impact: HIGH
impactDescription: automatic subscription cleanup, better change detection
tags: template, async-pipe, rxjs, subscriptions, memory-leaks
---

## Use Async Pipe Instead of Manual Subscriptions

Use the `async` pipe to subscribe to observables in templates. It automatically unsubscribes when the component is destroyed, preventing memory leaks.

**Incorrect (manual subscription - prone to memory leaks):**

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="user">
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    </div>
    <div *ngIf="loading">Loading...</div>
  `
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loading = true;
  private subscription!: Subscription;
  
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    // Easy to forget to unsubscribe!
    this.subscription = this.userService.getUser().subscribe(user => {
      this.user = user;
      this.loading = false;
    });
  }
  
  ngOnDestroy() {
    // Must remember to clean up
    this.subscription?.unsubscribe();
  }
}
```

**Correct (async pipe - automatic cleanup):**

```typescript
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (user$ | async; as user) {
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
    } @else {
      <div>Loading...</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  private userService = inject(UserService);
  
  user$ = this.userService.getUser();
}
```

**Combining multiple observables:**

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (vm$ | async; as vm) {
      <app-user-card [user]="vm.user" />
      <app-notifications [items]="vm.notifications" />
      <app-stats [data]="vm.stats" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private statsService = inject(StatsService);
  
  // Combine into single view model stream
  vm$ = combineLatest({
    user: this.userService.currentUser$,
    notifications: this.notificationService.notifications$,
    stats: this.statsService.dashboardStats$
  });
}
```

**With loading and error states:**

```typescript
@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (state$ | async; as state) {
      @if (state.loading) {
        <app-spinner />
      } @else if (state.error) {
        <app-error [message]="state.error" />
      } @else {
        <app-data-display [data]="state.data" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataViewComponent {
  private dataService = inject(DataService);
  
  state$ = this.dataService.getData().pipe(
    map(data => ({ loading: false, data, error: null })),
    startWith({ loading: true, data: null, error: null }),
    catchError(err => of({ loading: false, data: null, error: err.message }))
  );
}
```

**Avoid multiple async pipes for same observable:**

```typescript
// Bad - creates multiple subscriptions
@Component({
  template: `
    <h1>{{ (user$ | async)?.name }}</h1>
    <p>{{ (user$ | async)?.email }}</p>
    <span>{{ (user$ | async)?.role }}</span>
  `
})

// Good - single subscription with as syntax
@Component({
  template: `
    @if (user$ | async; as user) {
      <h1>{{ user.name }}</h1>
      <p>{{ user.email }}</p>
      <span>{{ user.role }}</span>
    }
  `
})
```

Reference: [Angular AsyncPipe](https://angular.dev/api/common/AsyncPipe)
