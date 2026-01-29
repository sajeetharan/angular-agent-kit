---
title: Rule Title Here
impact: MEDIUM
impactDescription: Optional description of impact (e.g., "10-50x improvement")
tags: tag1, tag2
---

## Rule Title Here

**Impact: MEDIUM (optional impact description)**

Brief explanation of the rule and why it matters. This should be clear and concise, explaining the performance implications for Angular applications.

**Incorrect (description of what's wrong):**

```typescript
// Bad code example here
@Component({
  selector: 'app-example',
  template: `<div>{{ badPattern() }}</div>`
})
export class ExampleComponent {
  // Example of anti-pattern
}
```

**Correct (description of what's right):**

```typescript
// Good code example here
@Component({
  selector: 'app-example',
  template: `<div>{{ goodPattern }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  // Example of best practice
}
```

Reference: [Link to documentation or resource](https://angular.dev)
