---
title: Use shareReplay for HTTP Caching
impact: HIGH
impactDescription: prevents duplicate HTTP requests, caches responses
tags: rxjs, http, caching, sharereplay, performance
---

## Use shareReplay for HTTP Caching

Use `shareReplay` to cache HTTP responses and prevent duplicate requests when multiple subscribers need the same data.

**Incorrect (new HTTP request per subscription):**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  
  // Every subscriber triggers a new HTTP request!
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// Component 1 subscribes - HTTP request #1
// Component 2 subscribes - HTTP request #2 (duplicate!)
// Component 3 subscribes - HTTP request #3 (duplicate!)
```

**Correct (shareReplay caches response):**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private userCache = new Map<string, Observable<User>>();
  
  getUser(id: string): Observable<User> {
    if (!this.userCache.has(id)) {
      const user$ = this.http.get<User>(`/api/users/${id}`).pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.userCache.set(id, user$);
    }
    return this.userCache.get(id)!;
  }
  
  // Clear cache when needed
  clearUserCache(id?: string): void {
    if (id) {
      this.userCache.delete(id);
    } else {
      this.userCache.clear();
    }
  }
}
```

**For singleton data (current user, config):**

```typescript
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  
  // Single cached config for entire app
  readonly config$ = this.http.get<AppConfig>('/api/config').pipe(
    shareReplay({ bufferSize: 1, refCount: false }) // Keep cache even with 0 subscribers
  );
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  
  // Current user, refreshes on login/logout
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  readonly currentUser$ = this.currentUserSubject.asObservable();
  
  loadCurrentUser(): Observable<User> {
    return this.http.get<User>('/api/me').pipe(
      tap(user => this.currentUserSubject.next(user)),
      shareReplay(1)
    );
  }
}
```

**With time-based cache expiration:**

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private cache$ = new Map<string, { data$: Observable<any>; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  getData<T>(endpoint: string): Observable<T> {
    const cached = this.cache$.get(endpoint);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data$;
    }
    
    const data$ = this.http.get<T>(endpoint).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
    
    this.cache$.set(endpoint, { data$, timestamp: now });
    return data$;
  }
}
```

**shareReplay options explained:**

```typescript
// bufferSize: Number of emissions to replay to new subscribers
// refCount: true = unsubscribe from source when no subscribers
//           false = keep subscription active (useful for hot observables)

// For HTTP (cold observable) - use refCount: true
this.http.get('/api/data').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);

// For persistent cache - use refCount: false
this.configService.config$.pipe(
  shareReplay({ bufferSize: 1, refCount: false })
);

// Shorthand (same as { bufferSize: 1, refCount: false })
this.data$.pipe(shareReplay(1));
```

**Refresh cache on demand:**

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private refresh$ = new BehaviorSubject<void>(undefined);
  
  products$ = this.refresh$.pipe(
    switchMap(() => this.http.get<Product[]>('/api/products')),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  
  refreshProducts(): void {
    this.refresh$.next();
  }
}
```

Reference: [RxJS shareReplay](https://rxjs.dev/api/operators/shareReplay)
