---
title: Use resource for Async Data Fetching
impact: HIGH
impactDescription: Replaces manual subscribe/loading/error boilerplate with reactive async state
tags: signals, resource, async, data-fetching, httpResource
---

## Use resource for Async Data Fetching

Use `resource()` to incorporate async data fetching into signal-based reactivity. It automatically re-fetches when dependencies change and exposes loading/error/value as signals.

**Incorrect (manual subscription with loading state boilerplate):**

```typescript
@Component({...})
export class UserProfile {
  userId = signal('123');
  user: User | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit() {
    // Must manually manage subscription, loading, errors, and re-fetching
    this.http.get(`/api/users/${this.userId()}`).subscribe({
      next: (user) => { this.user = user; this.loading = false; },
      error: (err) => { this.error = err.message; this.loading = false; }
    });
  }
}
```

**Correct (using resource):**

```typescript
import { Component, resource, signal, computed } from '@angular/core';

@Component({...})
export class UserProfile {
  userId = signal('123');

  userResource = resource({
    params: () => ({ id: this.userId() }),
    loader: async ({ params, abortSignal }) => {
      const response = await fetch(`/api/users/${params.id}`, { signal: abortSignal });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    }
  });

  userName = computed(() =>
    this.userResource.hasValue() ? this.userResource.value()?.name : 'Loading...'
  );
}
```

### Key Features

- **Auto-cancellation**: Pass `abortSignal` to fetch — previous requests are cancelled when params change
- **Status signals**: `value()`, `hasValue()`, `isLoading()`, `error()`, `status()`
- **Imperative reload**: Call `.reload()` to re-fetch without param changes
- **Optimistic updates**: Set value directly with `this.userResource.value.set(newData)`

### Prefer httpResource with HttpClient

When using Angular's `HttpClient`, prefer `httpResource` which integrates with interceptors:

```typescript
import { httpResource } from '@angular/common/http';

userResource = httpResource<User>({
  url: () => `/api/users/${this.userId()}`
});
```
