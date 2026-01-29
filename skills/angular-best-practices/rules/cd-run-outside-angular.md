---
title: Run Non-UI Code Outside NgZone
impact: HIGH
impactDescription: prevents unnecessary change detection from external events
tags: change-detection, ngzone, performance, optimization
---

## Run Non-UI Code Outside NgZone

Run code that doesn't affect the UI outside Angular's NgZone to prevent unnecessary change detection cycles. This is especially important for timers, scroll handlers, and third-party libraries.

**Incorrect (every mousemove triggers change detection):**

```typescript
@Component({
  selector: 'app-canvas',
  template: `<canvas #canvas></canvas>`
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  
  ngAfterViewInit() {
    // Every mousemove triggers change detection!
    this.canvas.nativeElement.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
    
    // setInterval triggers change detection every 16ms!
    setInterval(() => {
      this.updateAnimation();
    }, 16);
  }
}
```

**Correct (run outside zone, manually trigger detection when needed):**

```typescript
@Component({
  selector: 'app-canvas',
  template: `
    <canvas #canvas></canvas>
    <div>Position: {{ position.x }}, {{ position.y }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private animationId?: number;
  
  position = { x: 0, y: 0 };
  
  ngAfterViewInit() {
    // Run outside zone - no change detection on mousemove
    this.ngZone.runOutsideAngular(() => {
      this.canvas.nativeElement.addEventListener('mousemove', 
        this.handleMouseMove.bind(this)
      );
      
      // Animation loop outside zone
      this.startAnimation();
    });
  }
  
  private handleMouseMove(e: MouseEvent) {
    // Update internal state
    this.position = { x: e.clientX, y: e.clientY };
    
    // Only update canvas (no Angular binding)
    this.drawCursor(e.clientX, e.clientY);
    
    // If you need to update Angular bindings, run inside zone
    // this.ngZone.run(() => this.cdr.markForCheck());
  }
  
  private startAnimation() {
    const animate = () => {
      this.updateFrame();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  // Call this when you need to sync with Angular
  syncWithAngular() {
    this.ngZone.run(() => {
      this.cdr.markForCheck();
    });
  }
  
  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
```

**Common scenarios for runOutsideAngular:**

```typescript
export class PerformanceOptimizedComponent {
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  
  // WebSocket that sends frequent updates
  initWebSocket() {
    this.ngZone.runOutsideAngular(() => {
      const ws = new WebSocket('wss://stream.example.com');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.processData(data);
        
        // Only trigger change detection for important updates
        if (data.important) {
          this.ngZone.run(() => this.cdr.markForCheck());
        }
      };
    });
  }
  
  // Scroll handler with throttling
  initScrollHandler() {
    this.ngZone.runOutsideAngular(() => {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      });
    });
  }
  
  // Third-party library initialization
  initChart() {
    this.ngZone.runOutsideAngular(() => {
      // Chart.js, D3, etc. - they manage their own rendering
      const chart = new Chart(this.canvas, config);
    });
  }
}
```

**Key rule:** If the code doesn't update Angular templates or component state that needs to be reflected in the view, run it outside NgZone.

Reference: [NgZone API](https://angular.dev/api/core/NgZone)
