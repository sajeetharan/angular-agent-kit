---
title: Avoid Function Calls in Templates
impact: HIGH
impactDescription: function calls run every change detection cycle
tags: template, performance, function-calls, change-detection
---

## Avoid Function Calls in Templates

Never call methods in templates for data transformation or display logic. Methods execute on every change detection cycle, causing performance issues.

**Incorrect (method calls - run every cycle):**

```typescript
@Component({
  selector: 'app-order-list',
  template: `
    @for (order of orders; track order.id) {
      <div class="order">
        <span>{{ formatDate(order.createdAt) }}</span>
        <span>{{ calculateTotal(order) | currency }}</span>
        <span [class]="getStatusClass(order.status)">{{ order.status }}</span>
        <span>{{ isOverdue(order) ? 'OVERDUE' : '' }}</span>
      </div>
    }
  `
})
export class OrderListComponent {
  @Input() orders: Order[] = [];
  
  formatDate(date: Date): string {
    // Called 100s of times per second!
    return new Intl.DateTimeFormat('en-US').format(date);
  }
  
  calculateTotal(order: Order): number {
    // Expensive calculation on every cycle
    return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
  
  getStatusClass(status: string): string {
    // Simple logic, but still runs every cycle
    return `status-${status.toLowerCase()}`;
  }
  
  isOverdue(order: Order): boolean {
    return new Date() > order.dueDate;
  }
}
```

**Correct (pipes, computed properties, or pre-computed values):**

```typescript
// Use pipes for formatting
@Pipe({ name: 'statusClass', standalone: true, pure: true })
export class StatusClassPipe implements PipeTransform {
  transform(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}

@Pipe({ name: 'overdue', standalone: true, pure: true })
export class OverduePipe implements PipeTransform {
  transform(dueDate: Date): boolean {
    return new Date() > dueDate;
  }
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, StatusClassPipe, OverduePipe],
  template: `
    @for (order of orders; track order.id) {
      <div class="order">
        <span>{{ order.createdAt | date:'mediumDate' }}</span>
        <span>{{ order.total | currency }}</span>
        <span [class]="order.status | statusClass">{{ order.status }}</span>
        @if (order.dueDate | overdue) {
          <span class="overdue">OVERDUE</span>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent {
  // Pre-compute total when data is set
  @Input() set ordersInput(orders: Order[]) {
    this.orders = orders.map(order => ({
      ...order,
      total: order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    }));
  }
  orders: OrderWithTotal[] = [];
}
```

**With Signals (Angular 17+):**

```typescript
@Component({
  selector: 'app-order-summary',
  template: `
    <div>Total: {{ total() | currency }}</div>
    <div>Status: {{ statusDisplay() }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummaryComponent {
  order = input.required<Order>();
  
  // Computed signals only recalculate when inputs change
  total = computed(() => 
    this.order().items.reduce((sum, item) => sum + item.price * item.qty, 0)
  );
  
  statusDisplay = computed(() => {
    const status = this.order().status;
    return status.charAt(0).toUpperCase() + status.slice(1);
  });
}
```

**Acceptable method calls:**
- Event handlers: `(click)="handleClick()"`
- Template reference variables: `#input`
- Simple getters that return primitives (with OnPush)

Reference: [Angular Performance Best Practices](https://angular.dev/best-practices/runtime-performance)
