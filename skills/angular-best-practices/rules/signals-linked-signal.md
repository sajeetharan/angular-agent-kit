---
title: Use linkedSignal for Dependent Writable State
impact: HIGH
impactDescription: Eliminates effect-based state sync anti-patterns and ExpressionChanged errors
tags: signals, linkedSignal, reactivity, state-management
---

## Use linkedSignal for Dependent Writable State

Use `linkedSignal` when you need state that derives a default from other signals but can still be manually overridden by the user. Never use `effect` to sync signals.

**Incorrect (using effect to sync state — causes ExpressionChangedAfterItHasBeenChecked):**

```typescript
@Component({...})
export class ShippingPicker {
  shippingOptions = signal(['Ground', 'Air', 'Sea']);
  selectedOption = signal('Ground');

  constructor() {
    // ❌ Anti-pattern: syncing state via effect
    effect(() => {
      this.selectedOption.set(this.shippingOptions()[0]);
    });
  }
}
```

**Correct (using linkedSignal):**

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({...})
export class ShippingPicker {
  shippingOptions = signal(['Ground', 'Air', 'Sea']);

  // Resets to first option when shippingOptions changes, but still writable
  selectedOption = linkedSignal(() => this.shippingOptions()[0]);

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }
}
```

### Advanced: Preserving Previous Selection

Use the object syntax when you need to check if the previous selection is still valid:

```typescript
interface ShippingMethod { id: number; name: string; }

selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
  source: this.shippingOptions,
  computation: (newOptions, previous) => {
    // Keep previous selection if still valid, otherwise reset
    return newOptions.find(opt => opt.id === previous?.value.id) ?? newOptions[0];
  }
});
```

### Decision Guide

| Need | Use |
|------|-----|
| Strictly derived, never manually updated | `computed` |
| Derived default, but user can override | `linkedSignal` |
| Sync one signal to another | **Never use `effect`** — use `computed` or `linkedSignal` |
