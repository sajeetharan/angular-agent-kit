---
title: Separate Smart and Presentational Components
impact: MEDIUM-HIGH
impactDescription: improves testability, reusability, and change detection
tags: component, architecture, smart-presentational, patterns
---

## Separate Smart and Presentational Components

Separate components into "smart" (container) components that handle logic and data, and "presentational" (dumb) components that only render UI based on inputs.

**Incorrect (mixed concerns):**

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <div class="filter">
      <input [(ngModel)]="filterTerm" (input)="loadUsers()">
    </div>
    <div *ngFor="let user of users" class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button (click)="deleteUser(user.id)">Delete</button>
    </div>
    <div *ngIf="loading">Loading...</div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  
  users: User[] = [];
  loading = false;
  filterTerm = '';
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.loading = true;
    this.userService.getUsers(this.filterTerm).subscribe(users => {
      this.users = users;
      this.loading = false;
    });
  }
  
  deleteUser(id: string) {
    this.userService.delete(id).subscribe(() => this.loadUsers());
  }
}
```

**Correct (separated concerns):**

```typescript
// Smart component - handles data and logic
@Component({
  selector: 'app-user-list-container',
  standalone: true,
  imports: [UserListComponent, UserFilterComponent],
  template: `
    <app-user-filter 
      [initialValue]="filterTerm()"
      (filterChange)="onFilterChange($event)" 
    />
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (delete)="onDelete($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListContainerComponent {
  private userService = inject(UserService);
  
  users = signal<User[]>([]);
  loading = signal(false);
  filterTerm = signal('');
  
  constructor() {
    // React to filter changes
    effect(() => {
      this.loadUsers(this.filterTerm());
    });
  }
  
  onFilterChange(term: string) {
    this.filterTerm.set(term);
  }
  
  onDelete(userId: string) {
    this.userService.delete(userId)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadUsers(this.filterTerm()));
  }
  
  private loadUsers(filter: string) {
    this.loading.set(true);
    this.userService.getUsers(filter)
      .pipe(takeUntilDestroyed())
      .subscribe(users => {
        this.users.set(users);
        this.loading.set(false);
      });
  }
}

// Presentational component - pure rendering
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    @if (loading()) {
      <app-spinner />
    } @else {
      @for (user of users(); track user.id) {
        <app-user-card
          [user]="user"
          (deleteClick)="delete.emit(user.id)"
        />
      } @empty {
        <p>No users found</p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users = input<User[]>([]);
  loading = input(false);
  delete = output<string>();
}

// Presentational card component
@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ user().name }}</h3>
      <p>{{ user().email }}</p>
      <button (click)="deleteClick.emit()">Delete</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  user = input.required<User>();
  deleteClick = output<void>();
}
```

**Benefits of separation:**
- Presentational components are easily testable (pure input/output)
- Better OnPush compatibility (inputs clearly define when to update)
- Reusable UI components across features
- Clear data flow (top-down props, bottom-up events)

Reference: [Angular Architecture Patterns](https://angular.dev/guide/components)
