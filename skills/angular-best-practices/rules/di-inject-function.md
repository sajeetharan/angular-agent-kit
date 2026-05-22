---
title: Use inject() Function Over Constructor Injection
impact: HIGH
impactDescription: Enables better tree-shaking, functional patterns, and cleaner code
tags: dependency-injection, inject, services, best-practices
---

## Use inject() Function Over Constructor Injection

Use Angular's `inject()` function in class field initializers instead of constructor-based injection. This is the modern recommended approach.

**Incorrect (legacy constructor injection):**

```typescript
@Component({...})
export class NavbarComponent {
  constructor(
    private router: Router,
    private analytics: AnalyticsService,
    private authService: AuthService
  ) {}

  navigate() {
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

**Correct (inject() in field initializers):**

```typescript
import { Component, inject } from '@angular/core';

@Component({...})
export class NavbarComponent {
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private authService = inject(AuthService);

  navigate() {
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

### Valid Injection Contexts

`inject()` can only be called in an **injection context**:

1. **Class field initializers** (recommended)
2. **Constructor body**
3. **Factory functions** used in providers
4. **Route guards and resolvers**

### Use providedIn: 'root' for Tree-Shakeable Services

```typescript
@Injectable({
  providedIn: 'root' // Singleton, tree-shakeable — removed if unused
})
export class AnalyticsService {
  trackEvent(category: string, value: string) {
    // ...
  }
}
```

### Benefits

- Cleaner syntax without constructor parameter lists
- Works in abstract classes and mixins
- Enables functional composition patterns (guards, resolvers)
- Better tree-shaking with `providedIn: 'root'`
