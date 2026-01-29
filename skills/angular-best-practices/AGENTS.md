# Angular Best Practices

**Version 1.0.0**  
Angular Agent Kit  
January 2026

> **Note:**  
> This document is primarily for agents and LLMs to follow when maintaining,  
> generating, or refactoring Angular application code. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

Performance optimization and best practices guide for Angular applications, ordered by impact. Contains rules for change detection, bundle optimization, template performance, RxJS patterns, component architecture, HTTP handling, forms, and testing.

---

## Table of Contents

1. [Change Detection](#1-change-detection) — **CRITICAL**
   - 1.1 [Use OnPush Change Detection Strategy](#11-use-onpush-change-detection-strategy)
   - 1.2 [Always Use trackBy in *ngFor](#12-always-use-trackby-in-ngfor)
   - 1.3 [Prefer Pure Pipes Over Methods in Templates](#13-prefer-pure-pipes-over-methods-in-templates)
   - 1.4 [Use Immutable Data Patterns](#14-use-immutable-data-patterns)
   - 1.5 [Detach Change Detection for Heavy Computations](#15-detach-change-detection-for-heavy-computations)
   - 1.6 [Run Non-UI Code Outside NgZone](#16-run-non-ui-code-outside-ngzone)
2. [Bundle Size Optimization](#2-bundle-size-optimization) — **CRITICAL**
   - 2.1 [Lazy Load Feature Modules](#21-lazy-load-feature-modules)
   - 2.2 [Ensure Tree-Shakeable Providers](#22-ensure-tree-shakeable-providers)
   - 2.3 [Use Standalone Components](#23-use-standalone-components)
   - 2.4 [Use @defer for Heavy Components](#24-use-defer-for-heavy-components)
   - 2.5 [Implement Smart Preloading Strategies](#25-implement-smart-preloading-strategies)
   - 2.6 [Import Directly, Avoid Barrel Files](#26-import-directly-avoid-barrel-files)
3. [Template Performance](#3-template-performance) — **HIGH**
   - 3.1 [Avoid Function Calls in Templates](#31-avoid-function-calls-in-templates)
   - 3.2 [Use Async Pipe Instead of Manual Subscriptions](#32-use-async-pipe-instead-of-manual-subscriptions)
   - 3.3 [Use ng-container for Structural Directives](#33-use-ng-container-for-structural-directives)
   - 3.4 [Use New Control Flow Syntax](#34-use-new-control-flow-syntax)
   - 3.5 [Never Use *ngIf and *ngFor on Same Element](#35-never-use-ngif-and-ngfor-on-same-element)
   - 3.6 [Use NgOptimizedImage for Images](#36-use-ngoptimizedimage-for-images)
4. [RxJS & Async Operations](#4-rxjs--async-operations) — **HIGH**
   - 4.1 [Never Nest Subscriptions](#41-never-nest-subscriptions)
   - 4.2 [Always Unsubscribe](#42-always-unsubscribe)
   - 4.3 [Use shareReplay for HTTP Caching](#43-use-sharereplay-for-http-caching)
   - 4.4 [Choose the Correct Flattening Operator](#44-choose-the-correct-flattening-operator)
   - 4.5 [Prefer Signals for Synchronous State](#45-prefer-signals-for-synchronous-state)
   - 4.6 [Debounce and Throttle User Input Events](#46-debounce-and-throttle-user-input-events)
5. [Component Architecture](#5-component-architecture) — **MEDIUM-HIGH**
   - 5.1 [Separate Smart and Presentational Components](#51-separate-smart-and-presentational-components)
6. [HTTP & Data Fetching](#6-http--data-fetching) — **MEDIUM**
   - 6.1 [Use HTTP Interceptors for Cross-Cutting Concerns](#61-use-http-interceptors-for-cross-cutting-concerns)
7. [Forms & Validation](#7-forms--validation) — **MEDIUM**
   - 7.1 [Prefer Reactive Forms for Complex Forms](#71-prefer-reactive-forms-for-complex-forms)

---

## 1. Change Detection

**Impact: CRITICAL**

Change detection strategy is foundational to Angular performance. Poor change detection causes excessive re-renders, memory leaks, and sluggish UI. OnPush strategy combined with immutable data patterns yields the largest performance gains.

### 1.1 Use OnPush Change Detection Strategy

**Impact: CRITICAL (2-10x performance improvement in complex apps)**

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

### 1.2 Always Use trackBy in *ngFor

**Impact: CRITICAL (prevents DOM destruction/recreation, 5-50x faster list updates)**

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

Reference: [Angular *ngFor trackBy](https://angular.dev/api/common/NgFor)

### 1.3 Prefer Pure Pipes Over Methods in Templates

**Impact: CRITICAL (method calls run every change detection cycle, pipes are memoized)**

Never call methods directly in templates for data transformation. Methods execute on every change detection cycle, while pure pipes only recalculate when their input changes.

**Incorrect (method call - runs every change detection cycle):**

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user">
      <h2>{{ getFullName() }}</h2>
      <p>{{ formatDate(user.createdAt) }}</p>
    </div>
  `
})
export class UserCardComponent {
  @Input() user!: User;
  
  getFullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}
```

**Correct (pure pipes - only recalculate when input changes):**

```typescript
@Pipe({ name: 'fullName', pure: true, standalone: true })
export class FullNamePipe implements PipeTransform {
  transform(user: { firstName: string; lastName: string }): string {
    return `${user.firstName} ${user.lastName}`;
  }
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [FullNamePipe, DatePipe],
  template: `
    <div class="user">
      <h2>{{ user | fullName }}</h2>
      <p>{{ user.createdAt | date:'mediumDate' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  @Input() user!: User;
}
```

Reference: [Angular Pipes Guide](https://angular.dev/guide/pipes)

### 1.4 Use Immutable Data Patterns

**Impact: CRITICAL (enables OnPush detection, prevents subtle bugs)**

Always use immutable data patterns with OnPush change detection. Mutating objects or arrays won't trigger change detection because the reference stays the same.

**Incorrect (mutation - OnPush won't detect changes):**

```typescript
addTodo() {
  // WRONG: Mutating array - view won't update!
  this.todos.push({ id: Date.now(), title: 'New Todo', completed: false });
}
```

**Correct (immutable - creates new references):**

```typescript
addTodo() {
  // Correct: New array reference
  this.todos = [
    ...this.todos,
    { id: Date.now(), title: 'New Todo', completed: false }
  ];
}
```

**With Signals (Angular 17+):**

```typescript
todos = signal<Todo[]>([]);

addTodo() {
  this.todos.update(current => [
    ...current,
    { id: Date.now(), title: 'New Todo', completed: false }
  ]);
}
```

Reference: [Angular Change Detection](https://angular.dev/best-practices/skipping-subtrees)

### 1.5 Detach Change Detection for Heavy Computations

**Impact: HIGH (prevents UI blocking during expensive operations)**

For components that perform heavy computations or render large datasets, detach from change detection and manually control when updates occur.

Reference: [ChangeDetectorRef API](https://angular.dev/api/core/ChangeDetectorRef)

### 1.6 Run Non-UI Code Outside NgZone

**Impact: HIGH (prevents unnecessary change detection from external events)**

Run code that doesn't affect the UI outside Angular's NgZone to prevent unnecessary change detection cycles. This is especially important for timers, scroll handlers, and third-party libraries.

```typescript
this.ngZone.runOutsideAngular(() => {
  // This won't trigger change detection
  setInterval(() => this.updateAnimation(), 16);
});
```

Reference: [NgZone API](https://angular.dev/api/core/NgZone)

---

## 2. Bundle Size Optimization

**Impact: CRITICAL**

Bundle size directly impacts initial load time and Time to Interactive. Lazy loading, tree shaking, and standalone components reduce initial payload and improve Core Web Vitals.

### 2.1 Lazy Load Feature Modules

**Impact: CRITICAL (reduces initial bundle by 30-70%, improves Time to Interactive)**

Lazy load feature modules to reduce initial bundle size. Only the code needed for the initial route is loaded upfront; other modules load on demand.

```typescript
export const routes: Routes = [
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  }
];
```

Reference: [Angular Lazy Loading](https://angular.dev/guide/routing/lazy-loading)

### 2.2 Ensure Tree-Shakeable Providers

**Impact: CRITICAL (removes unused services from bundle)**

Use `providedIn: 'root'` instead of the `providers` array. This enables tree-shaking to remove unused services.

```typescript
@Injectable({
  providedIn: 'root'  // Tree-shakeable singleton
})
export class UserService { }
```

Reference: [Angular Dependency Injection](https://angular.dev/guide/di/dependency-injection)

### 2.3 Use Standalone Components

**Impact: CRITICAL (smaller bundles, better tree-shaking, simpler architecture)**

Use standalone components, directives, and pipes instead of NgModules. Standalone APIs enable better tree-shaking and simpler mental models.

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [ButtonComponent], // Only ButtonComponent is bundled!
  template: `<app-button>Click</app-button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureComponent {}
```

Reference: [Angular Standalone Components](https://angular.dev/guide/components/importing)

### 2.4 Use @defer for Heavy Components

**Impact: HIGH (defers loading until needed, improves initial load time)**

Use the `@defer` block to lazy load heavy components, reducing initial bundle size.

```html
@defer (on viewport) {
  <app-heavy-chart [data]="chartData" />
} @placeholder {
  <div class="chart-skeleton">Loading chart...</div>
}
```

Reference: [Angular Defer](https://angular.dev/guide/defer)

### 2.5 Implement Smart Preloading Strategies

**Impact: HIGH (balances initial load with navigation speed)**

Use preloading strategies to load lazy modules in the background after the initial page loads.

Reference: [Angular Route Preloading](https://angular.dev/guide/routing/preloading)

### 2.6 Import Directly, Avoid Barrel Files

**Impact: HIGH (improves tree-shaking, reduces bundle size)**

Import from specific files instead of barrel files (index.ts) to improve tree-shaking.

```typescript
// Bad
import { ButtonComponent, CardComponent } from '@shared';

// Good
import { ButtonComponent } from '@shared/button/button.component';
```

Reference: [Angular Style Guide](https://angular.dev/style-guide)

---

## 3. Template Performance

**Impact: HIGH**

Template expressions run on every change detection cycle. Function calls in templates, missing trackBy, and inefficient structural directives cause performance degradation.

### 3.1 Avoid Function Calls in Templates

**Impact: HIGH (function calls run every change detection cycle)**

Never call methods in templates for data transformation or display logic. Use pipes or computed signals instead.

Reference: [Angular Performance Best Practices](https://angular.dev/best-practices/runtime-performance)

### 3.2 Use Async Pipe Instead of Manual Subscriptions

**Impact: HIGH (automatic subscription cleanup, better change detection)**

Use the `async` pipe to subscribe to observables in templates. It automatically unsubscribes when the component is destroyed.

```html
@if (user$ | async; as user) {
  <h1>{{ user.name }}</h1>
}
```

Reference: [Angular AsyncPipe](https://angular.dev/api/common/AsyncPipe)

### 3.3 Use ng-container for Structural Directives

**Impact: MEDIUM (no extra DOM elements, cleaner markup)**

Use `<ng-container>` when you need structural directives without adding extra DOM elements.

Reference: [Angular ng-container](https://angular.dev/api/core/ng-container)

### 3.4 Use New Control Flow Syntax

**Impact: HIGH (better performance, cleaner syntax, type narrowing)**

Use Angular 17+ built-in control flow (`@if`, `@for`, `@switch`) instead of structural directives.

```html
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>No items found</p>
}
```

Reference: [Angular Control Flow](https://angular.dev/guide/templates/control-flow)

### 3.5 Never Use *ngIf and *ngFor on Same Element

**Impact: HIGH (causes errors, use ng-container or control flow)**

Use `ng-container` or the new control flow syntax to combine multiple structural directives.

Reference: [Angular Structural Directives](https://angular.dev/guide/directives/structural-directives)

### 3.6 Use NgOptimizedImage for Images

**Impact: HIGH (automatic lazy loading, prevents layout shift, optimized loading)**

Use Angular's `NgOptimizedImage` directive for all images.

```html
<img 
  ngSrc="/assets/hero.jpg" 
  width="1200" 
  height="600" 
  priority
  alt="Hero banner"
/>
```

Reference: [Angular NgOptimizedImage](https://angular.dev/guide/image-optimization)

---

## 4. RxJS & Async Operations

**Impact: HIGH**

Proper RxJS usage prevents memory leaks, race conditions, and unnecessary API calls. Correct operator choice and subscription management are essential.

### 4.1 Never Nest Subscriptions

**Impact: HIGH (causes memory leaks, race conditions, hard to maintain)**

Never subscribe inside another subscription. Use RxJS operators like `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap`.

Reference: [RxJS Flattening Operators](https://rxjs.dev/guide/operators)

### 4.2 Always Unsubscribe

**Impact: HIGH (prevents memory leaks, component cleanup)**

Always clean up subscriptions using `takeUntilDestroyed()`, `DestroyRef`, or the `async` pipe.

```typescript
this.dataService.getData()
  .pipe(takeUntilDestroyed())
  .subscribe(data => this.data.set(data));
```

Reference: [Angular takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)

### 4.3 Use shareReplay for HTTP Caching

**Impact: HIGH (prevents duplicate HTTP requests, caches responses)**

Use `shareReplay` to cache HTTP responses and prevent duplicate requests.

Reference: [RxJS shareReplay](https://rxjs.dev/api/operators/shareReplay)

### 4.4 Choose the Correct Flattening Operator

**Impact: HIGH (prevents race conditions, proper async handling)**

Choose the right flattening operator based on your use case:
- `switchMap`: Cancel previous, use latest (search, navigation)
- `mergeMap`: Run all in parallel (batch processing)
- `concatMap`: Run sequentially (order-dependent operations)
- `exhaustMap`: Ignore until complete (prevent double-submit)

Reference: [RxJS Transformation Operators](https://rxjs.dev/guide/operators#transformation-operators)

### 4.5 Prefer Signals for Synchronous State

**Impact: HIGH (simpler mental model, better performance, fine-grained reactivity)**

Use Angular Signals for synchronous state management. Reserve Observables for async operations.

Reference: [Angular Signals](https://angular.dev/guide/signals)

### 4.6 Debounce and Throttle User Input Events

**Impact: HIGH (reduces unnecessary API calls and processing)**

Use `debounceTime` for search inputs and `throttleTime` for continuous events.

Reference: [RxJS debounceTime](https://rxjs.dev/api/operators/debounceTime)

---

## 5. Component Architecture

**Impact: MEDIUM-HIGH**

Well-structured components with clear separation of concerns improve maintainability, testability, and enable better change detection optimization.

### 5.1 Separate Smart and Presentational Components

**Impact: MEDIUM-HIGH (improves testability, reusability, and change detection)**

Separate components into "smart" (container) components that handle logic and data, and "presentational" (dumb) components that only render UI based on inputs.

Reference: [Angular Architecture Patterns](https://angular.dev/guide/components)

---

## 6. HTTP & Data Fetching

**Impact: MEDIUM**

Efficient HTTP handling with interceptors, caching, and proper error handling improves both performance and user experience.

### 6.1 Use HTTP Interceptors for Cross-Cutting Concerns

**Impact: MEDIUM (centralizes auth, logging, error handling)**

Use HTTP interceptors to handle authentication tokens, logging, error handling, and other cross-cutting concerns.

Reference: [Angular HTTP Interceptors](https://angular.dev/guide/http/interceptors)

---

## 7. Forms & Validation

**Impact: MEDIUM**

Reactive forms with typed controls and efficient validation improve developer experience and prevent runtime errors.

### 7.1 Prefer Reactive Forms for Complex Forms

**Impact: MEDIUM (better validation, testing, and type safety)**

Use reactive forms with strict typing for complex forms.

Reference: [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)

---

## References

- [Angular Documentation](https://angular.dev)
- [Angular Performance Best Practices](https://angular.dev/best-practices/runtime-performance)
- [Angular Style Guide](https://angular.dev/style-guide)
- [RxJS Documentation](https://rxjs.dev)
