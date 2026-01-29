---
title: Never Use *ngIf and *ngFor on Same Element
impact: HIGH
impactDescription: causes errors, use ng-container or control flow
tags: template, structural-directives, ngif, ngfor
---

## Never Use *ngIf and *ngFor on Same Element

You cannot use multiple structural directives on the same element. Use `ng-container` or the new control flow syntax to combine them.

**Incorrect (multiple structural directives - ERROR):**

```html
<!-- This will NOT work - Angular error -->
<div *ngIf="showItems" *ngFor="let item of items">
  {{ item.name }}
</div>

<!-- This also won't work -->
<li *ngFor="let item of items" *ngIf="item.active">
  {{ item.name }}
</li>
```

**Correct (ng-container wrapper):**

```html
<!-- Wrap with ng-container for ngIf -->
<ng-container *ngIf="showItems">
  <div *ngFor="let item of items">
    {{ item.name }}
  </div>
</ng-container>

<!-- Filter inside ngFor -->
<ng-container *ngFor="let item of items">
  <li *ngIf="item.active">
    {{ item.name }}
  </li>
</ng-container>
```

**Better (new control flow - Angular 17+):**

```html
<!-- Control flow blocks can be nested naturally -->
@if (showItems) {
  @for (item of items; track item.id) {
    <div>{{ item.name }}</div>
  }
}

<!-- Conditional inside loop -->
@for (item of items; track item.id) {
  @if (item.active) {
    <li>{{ item.name }}</li>
  }
}
```

**Best (filter in component for performance):**

```typescript
@Component({
  selector: 'app-item-list',
  template: `
    @for (item of activeItems(); track item.id) {
      <li>{{ item.name }}</li>
    } @empty {
      <li>No active items</li>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemListComponent {
  items = input<Item[]>([]);
  
  // Filter once when items change, not every render
  activeItems = computed(() => 
    this.items().filter(item => item.active)
  );
}
```

**With observables:**

```typescript
@Component({
  selector: 'app-item-list',
  template: `
    @if (activeItems$ | async; as items) {
      @for (item of items; track item.id) {
        <li>{{ item.name }}</li>
      } @empty {
        <li>No active items</li>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemListComponent {
  private itemService = inject(ItemService);
  
  activeItems$ = this.itemService.items$.pipe(
    map(items => items.filter(item => item.active))
  );
}
```

**Order matters for ng-container:**

```html
<!-- Filter first, then show (better performance) -->
<ng-container *ngFor="let item of items">
  <ng-container *ngIf="item.visible">
    <div>{{ item.name }}</div>
  </ng-container>
</ng-container>

<!-- vs Show first, then loop (ngIf evaluated once) -->
<ng-container *ngIf="showList">
  <ng-container *ngFor="let item of items">
    <div>{{ item.name }}</div>
  </ng-container>
</ng-container>
```

Reference: [Angular Structural Directives](https://angular.dev/guide/directives/structural-directives)
