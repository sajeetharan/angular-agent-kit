---
title: Always Unsubscribe (takeUntilDestroyed, DestroyRef)
impact: HIGH
impactDescription: prevents memory leaks, component cleanup
tags: rxjs, subscriptions, memory-leaks, cleanup, destroyref
---

## Always Unsubscribe (takeUntilDestroyed, DestroyRef)

Always clean up subscriptions to prevent memory leaks. Use `takeUntilDestroyed()`, `DestroyRef`, or the `async` pipe for automatic cleanup.

**Incorrect (no cleanup - memory leak):**

```typescript
@Component({...})
export class DataComponent implements OnInit {
  data: Data[] = [];
  
  ngOnInit() {
    // Memory leak! Subscription lives forever
    this.dataService.getData().subscribe(data => {
      this.data = data;
    });
    
    // Another leak
    interval(1000).subscribe(() => {
      this.updateTimestamp();
    });
  }
}
```

**Correct (takeUntilDestroyed - Angular 16+):**

```typescript
@Component({
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataComponent {
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  
  data = signal<Data[]>([]);
  
  constructor() {
    // Automatically unsubscribes when component is destroyed
    this.dataService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => this.data.set(data));
    
    // Works with any observable
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateTimestamp());
  }
}
```

**Using DestroyRef directly:**

```typescript
@Component({...})
export class DataComponent {
  private destroyRef = inject(DestroyRef);
  
  ngOnInit() {
    const subscription = this.dataService.getData().subscribe(data => {
      this.handleData(data);
    });
    
    // Register cleanup callback
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
      this.cleanup();
    });
  }
}
```

**Best approach - async pipe (automatic cleanup):**

```typescript
@Component({
  template: `
    @if (data$ | async; as data) {
      @for (item of data; track item.id) {
        <app-item [item]="item" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataComponent {
  private dataService = inject(DataService);
  
  // No manual subscription needed!
  data$ = this.dataService.getData();
}
```

**Multiple subscriptions with signals:**

```typescript
@Component({...})
export class DashboardComponent {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  
  user = signal<User | null>(null);
  notifications = signal<Notification[]>([]);
  
  constructor() {
    // Each subscription auto-cleans up
    toObservable(this.userService.currentUser$)
      .pipe(takeUntilDestroyed())
      .subscribe(user => this.user.set(user));
    
    this.notificationService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe(notifs => this.notifications.set(notifs));
  }
}
```

**For services (not destroyed with component):**

```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private destroy$ = new Subject<void>();
  
  connect() {
    this.socket.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => this.handleMessage(msg));
  }
  
  disconnect() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Legacy approach (still works but verbose):**

```typescript
@Component({...})
export class LegacyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.handleData(data));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

Reference: [Angular takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)
