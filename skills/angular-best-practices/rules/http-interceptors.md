---
title: Use HTTP Interceptors for Cross-Cutting Concerns
impact: MEDIUM
impactDescription: centralizes auth, logging, error handling
tags: http, interceptors, authentication, error-handling
---

## Use HTTP Interceptors for Cross-Cutting Concerns

Use HTTP interceptors to handle authentication tokens, logging, error handling, and other cross-cutting concerns in a centralized way.

**Incorrect (repeated logic in every service):**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  
  getUsers(): Observable<User[]> {
    // Repeated in every method!
    const token = this.auth.getToken();
    return this.http.get<User[]>('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.auth.logout();
        }
        console.error('Error:', err);
        return throwError(() => err);
      })
    );
  }
}
```

**Correct (interceptors for cross-cutting concerns):**

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        snackbar.open('Access denied', 'Close');
      } else if (error.status >= 500) {
        snackbar.open('Server error. Please try again.', 'Close');
      }
      
      return throwError(() => error);
    })
  );
};

// logging.interceptor.ts
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(`${req.method} ${req.url} - ${duration}ms`);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error(`${req.method} ${req.url} FAILED - ${duration}ms`, error);
      }
    })
  );
};

// app.config.ts - Register interceptors
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor,
        errorInterceptor
      ])
    )
  ]
};

// Now services are clean
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
    // Auth header added automatically
    // Errors handled automatically
    // Logging happens automatically
  }
}
```

**Retry interceptor:**

```typescript
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Only retry GET requests
  if (req.method !== 'GET') {
    return next(req);
  }
  
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Exponential backoff
        if (error.status >= 500) {
          return timer(Math.pow(2, retryCount) * 1000);
        }
        return throwError(() => error);
      }
    })
  );
};
```

**Loading indicator interceptor:**

```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  
  loading.show();
  
  return next(req).pipe(
    finalize(() => loading.hide())
  );
};
```

Reference: [Angular HTTP Interceptors](https://angular.dev/guide/http/interceptors)
