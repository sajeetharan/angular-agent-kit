---
title: Choose the Correct Flattening Operator
impact: HIGH
impactDescription: prevents race conditions, proper async handling
tags: rxjs, operators, switchmap, mergemap, concatmap, exhaustmap
---

## Choose the Correct Flattening Operator

Choose the right flattening operator (`switchMap`, `mergeMap`, `concatMap`, `exhaustMap`) based on your use case. Wrong choice leads to race conditions, lost data, or performance issues.

**switchMap - Cancel Previous, Use Latest:**

```typescript
// BEST FOR: Search, autocomplete, navigation, latest value scenarios
// Behavior: Cancels previous inner observable when new source emits

@Component({...})
export class SearchComponent {
  searchControl = new FormControl('');
  
  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.searchService.search(term))
    // If user types "ang", "angu", "angular" quickly,
    // only the "angular" request completes
  );
}

// Navigation - cancel pending request on route change
@Component({...})
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  
  user$ = this.route.params.pipe(
    switchMap(params => this.userService.getUser(params['id']))
    // Navigating /users/1 -> /users/2 cancels the first request
  );
}
```

**mergeMap - Run All in Parallel:**

```typescript
// BEST FOR: Independent operations, batch processing
// Behavior: All inner observables run concurrently

@Injectable({ providedIn: 'root' })
export class BatchService {
  // Process multiple items in parallel
  processItems(items: Item[]): Observable<Result[]> {
    return from(items).pipe(
      mergeMap(item => this.processItem(item), 3), // Max 3 concurrent
      toArray()
    );
  }
  
  // Upload multiple files simultaneously
  uploadFiles(files: File[]): Observable<UploadResult> {
    return from(files).pipe(
      mergeMap(file => this.uploadService.upload(file))
    );
  }
}
```

**concatMap - Run Sequentially:**

```typescript
// BEST FOR: Order-dependent operations, queued requests
// Behavior: Waits for each inner observable to complete before next

@Injectable({ providedIn: 'root' })
export class TransactionService {
  // Transactions must happen in order
  processTransactions(transactions: Transaction[]): Observable<Result> {
    return from(transactions).pipe(
      concatMap(tx => this.processTransaction(tx))
      // tx1 completes, then tx2 starts, then tx3...
    );
  }
}

// Form wizard - steps must complete in order
@Component({...})
export class WizardComponent {
  submitWizard(steps: WizardStep[]): Observable<void> {
    return from(steps).pipe(
      concatMap(step => this.saveStep(step)),
      last(), // Emit only when all complete
      mapTo(void 0)
    );
  }
}
```

**exhaustMap - Ignore Until Complete:**

```typescript
// BEST FOR: Preventing double-clicks, form submissions
// Behavior: Ignores new source emissions until inner completes

@Component({...})
export class CheckoutComponent {
  private submitClick$ = new Subject<void>();
  
  // Prevents double-submit even if user clicks rapidly
  submitResult$ = this.submitClick$.pipe(
    exhaustMap(() => this.orderService.submitOrder(this.form.value))
    // Second click while submitting is ignored
  );
  
  submit(): void {
    this.submitClick$.next();
  }
}

// Refresh button - ignore clicks while refreshing
@Component({...})
export class DashboardComponent {
  private refresh$ = new Subject<void>();
  
  data$ = this.refresh$.pipe(
    startWith(void 0), // Initial load
    exhaustMap(() => this.dataService.getData().pipe(
      catchError(err => of({ error: err.message }))
    ))
  );
}
```

**Quick Reference:**

| Operator | Concurrent | Cancels Previous | Ignores New | Use Case |
|----------|-----------|------------------|-------------|----------|
| switchMap | No | Yes | No | Search, navigation |
| mergeMap | Yes | No | No | Batch processing |
| concatMap | No | No | No | Sequential operations |
| exhaustMap | No | No | Yes | Prevent double-submit |

Reference: [RxJS Transformation Operators](https://rxjs.dev/guide/operators#transformation-operators)
