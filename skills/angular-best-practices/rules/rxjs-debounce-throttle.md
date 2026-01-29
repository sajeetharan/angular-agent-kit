---
title: Debounce and Throttle User Input Events
impact: HIGH
impactDescription: reduces unnecessary API calls and processing
tags: rxjs, debounce, throttle, performance, user-input
---

## Debounce and Throttle User Input Events

Use `debounceTime` for search inputs and `throttleTime` for continuous events like scroll or resize. This reduces unnecessary processing and API calls.

**Incorrect (fires on every keystroke):**

```typescript
@Component({
  template: `<input (input)="search($event)">`
})
export class SearchComponent {
  search(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    // Fires on every keystroke - too many API calls!
    this.searchService.search(term).subscribe(results => {
      this.results = results;
    });
  }
}
```

**Correct (debounced search):**

```typescript
@Component({
  template: `
    <input [formControl]="searchControl" placeholder="Search...">
    @for (result of results$ | async; track result.id) {
      <div>{{ result.name }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  searchControl = new FormControl('');
  
  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),           // Wait 300ms after last keystroke
    distinctUntilChanged(),       // Only if value changed
    filter(term => term.length >= 2), // Min 2 characters
    switchMap(term => this.searchService.search(term).pipe(
      catchError(() => of([]))   // Handle errors gracefully
    ))
  );
}
```

**Throttle for continuous events:**

```typescript
@Component({...})
export class ScrollComponent implements OnInit {
  private ngZone = inject(NgZone);
  
  ngOnInit() {
    // Run outside Angular for better performance
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'scroll').pipe(
        throttleTime(100),  // Max once per 100ms
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => {
        this.handleScroll();
      });
    });
  }
  
  private handleScroll() {
    const scrollY = window.scrollY;
    // Update UI only when necessary
    if (this.shouldUpdateUI(scrollY)) {
      this.ngZone.run(() => {
        this.scrollPosition.set(scrollY);
      });
    }
  }
}
```

**debounceTime vs throttleTime:**

```typescript
// debounceTime: Waits for pause in emissions
// Use for: Search, form validation, save drafts
searchTerm$.pipe(
  debounceTime(300)  // Emits 300ms after LAST keystroke
);

// throttleTime: Emits at regular intervals during stream
// Use for: Scroll, resize, mouse move, real-time updates
scroll$.pipe(
  throttleTime(100)  // Emits at most every 100ms
);

// auditTime: Like throttle, but emits LAST value in window
scroll$.pipe(
  auditTime(100)  // Emits last value every 100ms
);

// sampleTime: Emits most recent value at intervals
data$.pipe(
  sampleTime(1000)  // Sample every 1 second
);
```

**Auto-save with debounce:**

```typescript
@Component({...})
export class EditorComponent {
  form = inject(FormBuilder).group({
    title: [''],
    content: ['']
  });
  
  private saveStatus = signal<'saved' | 'saving' | 'unsaved'>('saved');
  
  constructor() {
    this.form.valueChanges.pipe(
      tap(() => this.saveStatus.set('unsaved')),
      debounceTime(2000),  // Wait 2 seconds after last change
      switchMap(value => {
        this.saveStatus.set('saving');
        return this.documentService.save(value).pipe(
          tap(() => this.saveStatus.set('saved')),
          catchError(err => {
            this.saveStatus.set('unsaved');
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed()
    ).subscribe();
  }
}
```

**Resize observer with throttle:**

```typescript
@Component({...})
export class ResponsiveComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  
  containerWidth = signal(0);
  
  ngAfterViewInit() {
    const resizeObserver = new ResizeObserver(entries => {
      // Already throttled by ResizeObserver, but can add more
      const width = entries[0].contentRect.width;
      this.containerWidth.set(width);
    });
    
    resizeObserver.observe(this.container.nativeElement);
    
    this.destroyRef.onDestroy(() => {
      resizeObserver.disconnect();
    });
  }
}
```

Reference: [RxJS debounceTime](https://rxjs.dev/api/operators/debounceTime)
