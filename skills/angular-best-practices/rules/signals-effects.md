---
title: Use Effects Only for Side Effects, Never for State Sync
impact: HIGH
impactDescription: Prevents ExpressionChangedAfterItHasBeenChecked errors and infinite loops
tags: signals, effects, afterRenderEffect, side-effects, anti-pattern
---

## Use Effects Only for Side Effects, Never for State Sync

Use `effect()` exclusively for syncing signal state to imperative non-signal APIs (logging, localStorage, third-party libraries). Never use effects to propagate state between signals.

**Incorrect (using effect to sync state — causes infinite loops):**

```typescript
@Component({...})
export class Example {
  firstName = signal('');
  lastName = signal('');
  fullName = signal('');

  constructor() {
    // ❌ NEVER do this - causes ExpressionChangedAfterItHasBeenChecked
    effect(() => {
      this.fullName.set(`${this.firstName()} ${this.lastName()}`);
    });
  }
}
```

**Correct (use computed for derived state):**

```typescript
@Component({...})
export class Example {
  firstName = signal('');
  lastName = signal('');
  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

### Valid Use Cases for effect()

```typescript
constructor() {
  // ✅ Logging/analytics
  effect(() => {
    console.log(`Count changed to ${this.count()}`);
  });

  // ✅ Syncing to localStorage
  effect(() => {
    localStorage.setItem('theme', this.theme());
  });

  // ✅ Cleanup with onCleanup
  effect((onCleanup) => {
    const timer = setTimeout(() => doSomething(), 1000);
    onCleanup(() => clearTimeout(timer));
  });
}
```

### DOM Manipulation: Use afterRenderEffect

For DOM reads/writes based on signal changes, use `afterRenderEffect` with render phases to prevent layout thrashing:

```typescript
import { afterRenderEffect, viewChild, ElementRef } from '@angular/core';

constructor() {
  afterRenderEffect({
    earlyRead: () => {
      return this.canvas().nativeElement.getBoundingClientRect().width;
    },
    write: (width) => {
      setupChart(this.canvas().nativeElement, width);
    }
  });
}
```

**Render phases** (executed in order): `earlyRead` → `write` → `mixedReadWrite` → `read`

- Never read DOM in the `write` phase
- Never write DOM in the `read` phase
- `afterRenderEffect` only runs client-side (not during SSR)
