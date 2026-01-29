---
title: Ensure Tree-Shakeable Providers
impact: CRITICAL
impactDescription: removes unused services from bundle
tags: bundle, tree-shaking, providers, services
---

## Ensure Tree-Shakeable Providers

Use `providedIn: 'root'` or `providedIn: SomeModule` instead of the `providers` array. This enables tree-shaking to remove unused services from the bundle.

**Incorrect (not tree-shakeable - always included):**

```typescript
// user.service.ts
@Injectable()
export class UserService {
  // Service implementation
}

// app.module.ts
@NgModule({
  providers: [
    UserService,           // Always included, even if never used
    LoggingService,        // Always included
    AnalyticsService       // Always included
  ]
})
export class AppModule {}
```

**Correct (tree-shakeable - removed if unused):**

```typescript
// user.service.ts
@Injectable({
  providedIn: 'root'  // Tree-shakeable singleton
})
export class UserService {
  private http = inject(HttpClient);
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

// Only included in bundle if something imports and uses it
```

**For services scoped to a feature module:**

```typescript
// admin.service.ts
@Injectable({
  providedIn: AdminModule  // Only available in AdminModule
})
export class AdminService {
  // Only bundled with AdminModule (if lazy loaded)
}

// Better approach with standalone - scope to route
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    providers: [AdminService], // Scoped to this route
    children: [
      { path: '', component: AdminDashboardComponent }
    ]
  }
];
```

**For environment-specific services:**

```typescript
// Use factory providers for conditional services
export const routes: Routes = [
  {
    path: '',
    providers: [
      {
        provide: LoggingService,
        useFactory: () => {
          return environment.production 
            ? new ProductionLoggingService()
            : new DebugLoggingService();
        }
      }
    ]
  }
];
```

**InjectionToken with tree-shaking:**

```typescript
// config.token.ts
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: environment.apiUrl,
    features: environment.features
  })
});

// Usage - only included if injected somewhere
export class ApiService {
  private config = inject(APP_CONFIG);
}
```

**Verify tree-shaking:**

```bash
# Build in production mode
ng build --configuration production

# Check bundle for service names
# Services not in bundle = successfully tree-shaken
```

Reference: [Angular Dependency Injection](https://angular.dev/guide/di/dependency-injection)
