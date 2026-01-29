---
title: Prefer Signals for Synchronous State
impact: HIGH
impactDescription: simpler mental model, better performance, fine-grained reactivity
tags: rxjs, signals, state, angular-16, reactivity
---

## Prefer Signals for Synchronous State

Use Angular Signals for synchronous state management. Reserve Observables for async operations like HTTP, WebSockets, or event streams.

**Incorrect (Observable for simple state):**

```typescript
@Component({...})
export class CounterComponent implements OnInit, OnDestroy {
  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();
  private destroy$ = new Subject<void>();
  
  currentCount = 0;
  
  ngOnInit() {
    this.count$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.currentCount = count);
  }
  
  increment() {
    this.countSubject.next(this.countSubject.value + 1);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Correct (Signal for synchronous state):**

```typescript
@Component({
  template: `
    <div>Count: {{ count() }}</div>
    <div>Doubled: {{ doubled() }}</div>
    <button (click)="increment()">+1</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(c => c + 1);
  }
}
```

**When to use Signals vs Observables:**

```typescript
// ✅ Signals - synchronous state
count = signal(0);
user = signal<User | null>(null);
isLoading = signal(false);
selectedItems = signal<string[]>([]);

// ✅ Signals - derived/computed values
total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));
isValid = computed(() => this.name().length > 0 && this.email().includes('@'));

// ✅ Observables - async operations
users$ = this.http.get<User[]>('/api/users');
messages$ = this.webSocket.messages$;
routeParams$ = this.route.params;
formChanges$ = this.form.valueChanges;
```

**Converting between Signals and Observables:**

```typescript
@Component({...})
export class HybridComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  
  // Convert Observable to Signal
  userId = toSignal(
    this.route.params.pipe(map(p => p['id'])),
    { initialValue: '' }
  );
  
  // Use signal in computed
  user = computed(() => {
    const id = this.userId();
    return id ? this.userCache.get(id) : null;
  });
  
  // Convert Signal to Observable (when needed)
  userId$ = toObservable(this.userId);
}
```

**Signal-based HTTP pattern:**

```typescript
@Component({
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (error()) {
      <app-error [message]="error()" />
    } @else {
      <app-user-list [users]="users()" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  private userService = inject(UserService);
  
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  constructor() {
    this.loadUsers();
  }
  
  private loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    
    this.userService.getUsers()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: users => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err.message);
          this.loading.set(false);
        }
      });
  }
}
```

**Signal inputs and outputs (Angular 17.1+):**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="card">
      <h3>{{ user().name }}</h3>
      <button (click)="select.emit(user())">Select</button>
    </div>
  `
})
export class UserCardComponent {
  // Signal-based input
  user = input.required<User>();
  
  // Still use regular output
  select = output<User>();
  
  // Computed from input
  initials = computed(() => {
    const name = this.user().name;
    return name.split(' ').map(n => n[0]).join('');
  });
}
```

Reference: [Angular Signals](https://angular.dev/guide/signals)
