---
title: Implement Smart Preloading Strategies
impact: HIGH
impactDescription: balances initial load with navigation speed
tags: bundle, preloading, routing, performance
---

## Implement Smart Preloading Strategies

Use preloading strategies to load lazy modules in the background after the initial page loads, making subsequent navigation instant.

**Incorrect (no preloading - navigation causes loading delay):**

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes) // No preloading - each navigation waits for bundle
  ]
};
```

**Correct (PreloadAllModules for smaller apps):**

```typescript
// app.config.ts
import { PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Preload all lazy routes
    )
  ]
};
```

**Better (Custom preloading for large apps):**

```typescript
// selective-preload.strategy.ts
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Only preload routes marked with data.preload
    if (route.data?.['preload']) {
      console.log(`Preloading: ${route.path}`);
      return load();
    }
    return of(null);
  }
}

// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component'),
    data: { preload: true }  // Will be preloaded
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    data: { preload: false } // Won't be preloaded (admin-only)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes'),
    data: { preload: true }  // Will be preloaded
  }
];

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(SelectivePreloadStrategy))
  ]
};
```

**Network-aware preloading:**

```typescript
@Injectable({ providedIn: 'root' })
export class NetworkAwarePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check network conditions
    const connection = (navigator as any).connection;
    
    // Don't preload on slow connections
    if (connection?.saveData || connection?.effectiveType === '2g') {
      return of(null);
    }
    
    // Only preload high-priority routes on 3g
    if (connection?.effectiveType === '3g') {
      return route.data?.['priority'] === 'high' ? load() : of(null);
    }
    
    // Preload everything on fast connections
    return route.data?.['preload'] !== false ? load() : of(null);
  }
}
```

**On-demand preloading (preload on hover):**

```typescript
// preload.service.ts
@Injectable({ providedIn: 'root' })
export class PreloadService {
  private router = inject(Router);
  private loader = inject(PreloadingStrategy);
  private preloaded = new Set<string>();
  
  preloadRoute(path: string): void {
    if (this.preloaded.has(path)) return;
    
    const route = this.findRoute(this.router.config, path);
    if (route?.loadChildren || route?.loadComponent) {
      this.preloaded.add(path);
      // Trigger the load
      this.router.navigate([path], { skipLocationChange: true })
        .then(() => this.router.navigate([this.router.url]));
    }
  }
}

// nav-link.component.ts
@Component({
  selector: 'app-nav-link',
  template: `
    <a [routerLink]="path" (mouseenter)="preload()">
      <ng-content />
    </a>
  `
})
export class NavLinkComponent {
  path = input.required<string>();
  private preloadService = inject(PreloadService);
  
  preload() {
    this.preloadService.preloadRoute(this.path());
  }
}
```

Reference: [Angular Route Preloading](https://angular.dev/guide/routing/preloading)
