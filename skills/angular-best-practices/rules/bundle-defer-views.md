---
title: Use @defer for Heavy Components
impact: HIGH
impactDescription: defers loading until needed, improves initial load time
tags: bundle, defer, lazy-loading, performance
---

## Use @defer for Heavy Components

Use the `@defer` block to lazy load heavy components, reducing initial bundle size and improving Time to Interactive.

**Incorrect (heavy component loaded immediately):**

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeavyChartComponent,    // 200KB - loaded immediately
    DataGridComponent,       // 150KB - loaded immediately
    RichTextEditorComponent  // 300KB - loaded immediately
  ],
  template: `
    <app-heavy-chart [data]="chartData" />
    <app-data-grid [rows]="gridData" />
    <app-rich-text-editor />
  `
})
export class DashboardComponent {}
```

**Correct (defer loading until visible):**

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeavyChartComponent,
    DataGridComponent,
    RichTextEditorComponent
  ],
  template: `
    <!-- Load when visible in viewport -->
    @defer (on viewport) {
      <app-heavy-chart [data]="chartData" />
    } @placeholder {
      <div class="chart-skeleton">Loading chart...</div>
    } @loading (minimum 500ms) {
      <app-spinner />
    } @error {
      <p>Failed to load chart</p>
    }

    <!-- Load after idle time -->
    @defer (on idle) {
      <app-data-grid [rows]="gridData" />
    } @placeholder {
      <div class="grid-skeleton"></div>
    }

    <!-- Load on interaction -->
    @defer (on interaction) {
      <app-rich-text-editor />
    } @placeholder {
      <button>Click to load editor</button>
    }
  `
})
export class DashboardComponent {
  chartData = signal<ChartData[]>([]);
  gridData = signal<GridRow[]>([]);
}
```

**@defer triggers:**

```html
<!-- on viewport - load when scrolled into view -->
@defer (on viewport) {
  <app-comments />
}

<!-- on idle - load when browser is idle -->
@defer (on idle) {
  <app-analytics />
}

<!-- on interaction - load on click/focus/etc -->
@defer (on interaction) {
  <app-settings-panel />
}

<!-- on hover - load when mouse hovers -->
@defer (on hover) {
  <app-preview />
}

<!-- on immediate - load immediately (for prefetch) -->
@defer (on immediate) {
  <app-critical-component />
}

<!-- on timer - load after delay -->
@defer (on timer(2000ms)) {
  <app-promotions />
}

<!-- when condition - load when expression is true -->
@defer (when isLoggedIn) {
  <app-user-dashboard />
}

<!-- Combine triggers -->
@defer (on viewport; prefetch on idle) {
  <app-heavy-component />
}
```

**With prefetch for better UX:**

```html
<!-- Prefetch on idle, show on viewport -->
@defer (on viewport; prefetch on idle) {
  <app-chart [data]="data" />
} @placeholder (minimum 100ms) {
  <div class="chart-placeholder"></div>
}

<!-- Prefetch on hover, show on interaction -->
@defer (on interaction; prefetch on hover) {
  <app-modal />
} @placeholder {
  <button>Open Modal</button>
}
```

**Placeholder and loading states:**

```html
@defer (on viewport) {
  <app-data-visualization />
} @placeholder (minimum 200ms) {
  <!-- Shown before trigger -->
  <div class="skeleton-loader"></div>
} @loading (after 100ms; minimum 500ms) {
  <!-- Shown while loading -->
  <app-spinner />
} @error {
  <!-- Shown on load failure -->
  <p>Failed to load. <button (click)="retry()">Retry</button></p>
}
```

Reference: [Angular Defer](https://angular.dev/guide/defer)
