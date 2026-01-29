---
title: Detach Change Detection for Heavy Computations
impact: HIGH
impactDescription: prevents UI blocking during expensive operations
tags: change-detection, detach, performance, heavy-computation
---

## Detach Change Detection for Heavy Computations

For components that perform heavy computations or render large datasets, detach from change detection and manually control when updates occur.

**Incorrect (change detection runs continuously):**

```typescript
@Component({
  selector: 'app-data-grid',
  template: `
    <table>
      <tr *ngFor="let row of processedData">
        <td *ngFor="let cell of row">{{ cell }}</td>
      </tr>
    </table>
  `
})
export class DataGridComponent implements OnInit {
  rawData: any[] = [];
  processedData: any[][] = [];
  
  ngOnInit() {
    // Heavy processing blocks UI
    this.processedData = this.processData(this.rawData);
  }
  
  processData(data: any[]): any[][] {
    // Expensive transformation
    return data.map(row => /* complex processing */);
  }
}
```

**Correct (detach and control change detection):**

```typescript
@Component({
  selector: 'app-data-grid',
  template: `
    <table>
      @for (row of processedData; track $index) {
        <tr>
          @for (cell of row; track $index) {
            <td>{{ cell }}</td>
          }
        </tr>
      }
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  
  rawData: any[] = [];
  processedData: any[][] = [];
  
  ngOnInit() {
    // Detach from automatic change detection
    this.cdr.detach();
    
    // Process data in chunks to avoid blocking UI
    this.processDataInChunks();
  }
  
  private async processDataInChunks() {
    const chunkSize = 100;
    const chunks = this.chunkArray(this.rawData, chunkSize);
    
    for (const chunk of chunks) {
      const processed = this.processChunk(chunk);
      this.processedData = [...this.processedData, ...processed];
      
      // Update view after each chunk
      this.cdr.detectChanges();
      
      // Yield to browser for responsiveness
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  // Reattach when user interacts
  onUserInteraction() {
    this.cdr.reattach();
    this.cdr.markForCheck();
  }
  
  ngOnDestroy() {
    // Always reattach before destroying
    this.cdr.reattach();
  }
}
```

**Using ChangeDetectorRef methods:**

```typescript
@Component({
  selector: 'app-live-feed',
  template: `<div>{{ data | json }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveFeedComponent {
  private cdr = inject(ChangeDetectorRef);
  data: any;
  
  // detach() - Stop automatic change detection
  pauseUpdates() {
    this.cdr.detach();
  }
  
  // reattach() - Resume automatic change detection
  resumeUpdates() {
    this.cdr.reattach();
  }
  
  // detectChanges() - Run change detection once NOW
  forceUpdate() {
    this.cdr.detectChanges();
  }
  
  // markForCheck() - Mark for check in next cycle
  scheduleUpdate() {
    this.cdr.markForCheck();
  }
}
```

**Best practices:**
- Always `reattach()` in `ngOnDestroy()` to prevent memory leaks
- Use `detectChanges()` sparingly - it runs synchronously
- Prefer `markForCheck()` for async updates
- Combine with `OnPush` for maximum control

Reference: [ChangeDetectorRef API](https://angular.dev/api/core/ChangeDetectorRef)
