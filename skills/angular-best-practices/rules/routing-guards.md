---
title: Use Functional Route Guards
impact: MEDIUM
impactDescription: Cleaner route protection with tree-shakeable functional guards
tags: routing, guards, security, canActivate, canMatch
---

## Use Functional Route Guards

Use functional route guards (Angular 15+) instead of class-based guards for route protection. They are simpler, tree-shakeable, and leverage `inject()`.

**Incorrect (legacy class-based guard):**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
```

**Correct (functional guard):**

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) return true;
  return router.parseUrl('/login'); // redirect via UrlTree
};

// Apply to routes
const routes: Routes = [
  {
    path: 'admin',
    component: AdminPage,
    canActivate: [authGuard]
  }
];
```

### Guard Types

| Guard | Purpose |
|-------|---------|
| `CanActivateFn` | Can the user access this route? |
| `CanActivateChildFn` | Can the user access child routes? |
| `CanDeactivateFn` | Can the user leave this route? (unsaved changes) |
| `CanMatchFn` | Should this route be considered at all? (feature flags) |

### Return Values

- `true` — allow navigation
- `false` — block navigation
- `UrlTree` / `RedirectCommand` — redirect to another route
- `Observable<boolean>` / `Promise<boolean>` — async resolution

### Security Note

Client-side guards are NOT a substitute for server-side security. Always verify permissions on the server.
