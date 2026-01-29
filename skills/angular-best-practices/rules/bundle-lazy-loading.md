---
title: Lazy Load Feature Modules
impact: CRITICAL
impactDescription: reduces initial bundle by 30-70%, improves Time to Interactive
tags: bundle, lazy-loading, routing, performance
---

## Lazy Load Feature Modules

Lazy load feature modules to reduce initial bundle size. Only the code needed for the initial route is loaded upfront; other modules load on demand.

**Incorrect (eager loading - everything in initial bundle):**

```typescript
// app.routes.ts - All modules loaded immediately
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent },     // Loaded even if user never visits
  { path: 'reports', component: ReportsComponent }, // Loaded even if user never visits
  { path: 'settings', component: SettingsComponent }
];

// app.module.ts - Importing all modules
@NgModule({
  imports: [
    AdminModule,    // 500KB loaded immediately
    ReportsModule,  // 300KB loaded immediately
    SettingsModule  // 200KB loaded immediately
  ]
})
export class AppModule {}
```

**Correct (lazy loading - load on navigation):**

```typescript
// app.routes.ts - Lazy load feature routes
export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  },
  { 
    path: 'reports', 
    loadChildren: () => import('./reports/reports.routes')
      .then(m => m.REPORTS_ROUTES)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./settings/settings.component')
      .then(m => m.SettingsComponent)
  }
];

// admin/admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: UserManagementComponent },
  { path: 'roles', component: RoleManagementComponent }
];
```

**Lazy load with standalone components (Angular 17+):**

```typescript
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(c => c.DashboardComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component')
      .then(c => c.ProfileComponent),
    // Lazy load child routes too
    children: [
      {
        path: 'settings',
        loadComponent: () => import('./profile/settings/settings.component')
          .then(c => c.SettingsComponent)
      }
    ]
  }
];
```

**Route-level code splitting with guards:**

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    canMatch: [adminGuard], // Check before loading bundle
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  }
];

// canMatch prevents bundle loading if guard fails
export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin();
};
```

**Verify lazy loading works:**

```bash
# Build with stats
ng build --stats-json

# Analyze bundle
npx webpack-bundle-analyzer dist/your-app/stats.json
```

Look for separate chunks like `admin-admin-module.js` in the build output.

Reference: [Angular Lazy Loading](https://angular.dev/guide/routing/lazy-loading)
