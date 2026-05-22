---
title: Use Signals for Reactive State Management
impact: CRITICAL
impactDescription: Foundation of modern Angular reactivity - replaces zone-based change detection
tags: signals, reactivity, state-management, performance
---

## Use Signals for Reactive State Management

Use Angular Signals (`signal`, `computed`) as the primary mechanism for managing reactive state in modern Angular applications. Signals provide fine-grained reactivity without zones.

**Incorrect (imperative state with manual change detection):**

```typescript
@Component({
  selector: 'app-counter',
  template: `<p>Count: {{ count }}, Double: {{ doubleCount }}</p>`
})
export class CounterComponent {
  count = 0;
  doubleCount = 0;

  increment() {
    this.count++;
    this.doubleCount = this.count * 2; // manual sync
  }
}
```

**Correct (signal-based reactive state):**

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `<p>Count: {{ count() }}, Double: {{ doubleCount() }}</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(v => v + 1);
  }
}
```

### Key Principles

- **`signal()`** creates writable state — use `.set()` for direct updates, `.update()` for derived updates
- **`computed()`** creates read-only derived state — lazily evaluated and memoized
- **Always call the getter** to read values: `count()`, not `count`
- **Expose readonly** from services: `this._count.asReadonly()`

### Reactive Contexts

Signal reads are tracked inside reactive contexts (`computed`, `effect`, templates). Use `untracked()` to read a signal without creating a dependency:

```typescript
effect(() => {
  // Only re-runs when currentUser changes, NOT when counter changes
  console.log(`User: ${currentUser()}, Count: ${untracked(counter)}`);
});
```

### Async Boundaries

Signal reads after an `await` are NOT tracked. Always read signals before async boundaries:

```typescript
// ❌ WRONG: theme() not tracked after await
effect(async () => {
  const data = await fetchData();
  console.log(theme());
});

// ✅ CORRECT: read signal before await
effect(async () => {
  const currentTheme = theme();
  const data = await fetchData();
  console.log(currentTheme);
});
```
