---
title: Use Signal-Based Inputs and Outputs
impact: HIGH
impactDescription: Better reactivity, type safety, and enables computed/effect chains from inputs
tags: components, inputs, outputs, signals, model-inputs
---

## Use Signal-Based Inputs and Outputs

Use `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators. Signal-based inputs integrate with computed signals and effects.

**Incorrect (legacy decorator-based):**

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `<p>{{ name }}</p><button (click)="select()">Select</button>`
})
export class UserComponent {
  @Input() name = '';
  @Input({ required: true }) id!: number;
  @Output() selected = new EventEmitter<number>();

  select() { this.selected.emit(this.id); }
}
```

**Correct (signal-based inputs and function-based outputs):**

```typescript
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `<p>{{ label() }}</p><button (click)="select()">Select</button>`
})
export class UserComponent {
  name = input('Guest');              // optional with default
  id = input.required<number>();      // required — build-time error if missing
  selected = output<number>();        // replaces EventEmitter

  // Signal inputs are reactive — use in computed/effect
  label = computed(() => `User: ${this.name()}`);

  select() { this.selected.emit(this.id()); }
}
```

### Model Inputs (Two-Way Binding)

Use `model()` for inputs that support two-way binding:

```typescript
@Component({
  selector: 'custom-counter',
  template: `<button (click)="increment()">{{ value() }}</button>`
})
export class CustomCounter {
  value = model(0);
  increment() { this.value.update(v => v + 1); }
}

// Usage: <custom-counter [(value)]="mySignal" />
```

### Input Transforms

```typescript
import { input, booleanAttribute, numberAttribute } from '@angular/core';

disabled = input(false, { transform: booleanAttribute });
size = input(0, { transform: numberAttribute });
label = input('', { alias: 'btnLabel' });
```

### Best Practices

- Prefer `input()` over `@Input()` for new code
- Use `input.required()` for mandatory data — catches missing bindings at build time
- Use `computed()` to derive template values from inputs instead of getters
- Use `output()` over `@Output()` with `EventEmitter`
