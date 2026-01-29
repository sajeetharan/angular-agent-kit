---
title: Use ng-container for Structural Directives
impact: MEDIUM
impactDescription: no extra DOM elements, cleaner markup
tags: template, ng-container, structural-directives, dom
---

## Use ng-container for Structural Directives

Use `<ng-container>` when you need structural directives without adding extra DOM elements. It renders children without a wrapper element.

**Incorrect (extra wrapper elements):**

```html
<!-- Creates unnecessary div in DOM -->
<div *ngIf="showContent">
  <span>Content 1</span>
  <span>Content 2</span>
</div>

<!-- Creates extra span wrapper -->
<span *ngFor="let item of items">
  {{ item.name }}
</span>

<!-- Multiple structural directives on same element - ERROR -->
<div *ngIf="showList" *ngFor="let item of items">
  {{ item.name }}
</div>
```

**Correct (ng-container - no DOM footprint):**

```html
<!-- No extra element in DOM -->
<ng-container *ngIf="showContent">
  <span>Content 1</span>
  <span>Content 2</span>
</ng-container>

<!-- Clean iteration without wrappers -->
<ul>
  <ng-container *ngFor="let item of items">
    <li>{{ item.name }}</li>
    <li class="divider"></li>
  </ng-container>
</ul>

<!-- Multiple structural directives -->
<ng-container *ngIf="showList">
  <ng-container *ngFor="let item of items">
    <div>{{ item.name }}</div>
  </ng-container>
</ng-container>
```

**With new control flow syntax (Angular 17+):**

```html
<!-- Control flow blocks already have no DOM footprint -->
@if (showContent) {
  <span>Content 1</span>
  <span>Content 2</span>
}

@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
  <li class="divider"></li>
}

<!-- Nested control flow -->
@if (showList) {
  @for (item of items; track item.id) {
    <div>{{ item.name }}</div>
  }
}
```

**Common use cases for ng-container:**

```html
<!-- Grouping siblings with ngIf -->
<ng-container *ngIf="user">
  <h1>{{ user.name }}</h1>
  <p>{{ user.bio }}</p>
  <app-user-actions [user]="user" />
</ng-container>

<!-- With ngSwitch -->
<ng-container [ngSwitch]="status">
  <ng-container *ngSwitchCase="'loading'">
    <app-spinner />
  </ng-container>
  <ng-container *ngSwitchCase="'error'">
    <app-error />
  </ng-container>
  <ng-container *ngSwitchDefault>
    <app-content />
  </ng-container>
</ng-container>

<!-- With ngTemplateOutlet -->
<ng-container *ngTemplateOutlet="customTemplate; context: { $implicit: data }">
</ng-container>
```

**ng-container with dependency injection:**

```html
<!-- Inject service at specific point in template -->
<ng-container *ngIf="someService.data$ | async as data">
  <child-component [data]="data" />
</ng-container>
```

**When to use div/span vs ng-container:**

```html
<!-- Use ng-container when: -->
<!-- - You only need structural directive logic -->
<!-- - You want to avoid extra DOM nodes -->
<!-- - You're grouping elements for conditional display -->
<ng-container *ngIf="condition">...</ng-container>

<!-- Use div/span when: -->
<!-- - You need to apply styles -->
<!-- - You need event bindings on the wrapper -->
<!-- - The wrapper is semantically meaningful -->
<div *ngIf="condition" class="card" (click)="handleClick()">...</div>
```

Reference: [Angular ng-container](https://angular.dev/api/core/ng-container)
