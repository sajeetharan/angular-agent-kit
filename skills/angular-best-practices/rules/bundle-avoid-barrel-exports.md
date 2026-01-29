---
title: Import Directly, Avoid Barrel Files
impact: HIGH
impactDescription: improves tree-shaking, reduces bundle size
tags: bundle, barrel-files, imports, tree-shaking
---

## Import Directly, Avoid Barrel Files

Import from specific files instead of barrel files (index.ts) to improve tree-shaking. Barrel imports can pull in more code than needed.

**Incorrect (barrel import - may import unused code):**

```typescript
// shared/index.ts (barrel file)
export * from './button/button.component';
export * from './card/card.component';
export * from './modal/modal.component';
export * from './tooltip/tooltip.directive';
export * from './date-format/date-format.pipe';
export * from './utils/helpers';
// ... 50 more exports

// feature.component.ts
import { ButtonComponent, CardComponent } from '@shared';
// May pull in modal, tooltip, etc. depending on bundler
```

**Correct (direct imports - precise tree-shaking):**

```typescript
// feature.component.ts
import { ButtonComponent } from '@shared/button/button.component';
import { CardComponent } from '@shared/card/card.component';
// Only these two components are included
```

**Configure path mappings for clean imports:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/button": ["src/app/shared/button/button.component"],
      "@shared/card": ["src/app/shared/card/card.component"],
      "@shared/modal": ["src/app/shared/modal/modal.component"],
      "@core/services/*": ["src/app/core/services/*"],
      "@core/models/*": ["src/app/core/models/*"]
    }
  }
}

// Usage
import { ButtonComponent } from '@shared/button';
import { UserService } from '@core/services/user.service';
```

**If you must use barrel files, use named exports carefully:**

```typescript
// shared/components/index.ts - OK for small groups
export { ButtonComponent } from './button/button.component';
export { CardComponent } from './card/card.component';

// DON'T do this - re-exports everything
export * from './button/button.component';
export * from './card/card.component';
export * from './modal/modal.component';
```

**Organize by feature, not type:**

```
# Bad - type-based organization leads to large barrels
src/
  components/
    index.ts  # exports 100 components
  services/
    index.ts  # exports 50 services
  pipes/
    index.ts  # exports 30 pipes

# Good - feature-based organization
src/
  features/
    users/
      user-list.component.ts
      user-detail.component.ts
      user.service.ts
      user.model.ts
    products/
      product-list.component.ts
      product.service.ts
  shared/
    ui/
      button/
        button.component.ts
      card/
        card.component.ts
```

**ESLint rule to enforce direct imports:**

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@shared"],
            "message": "Import from specific module path, e.g., @shared/button"
          }
        ]
      }
    ]
  }
}
```

Reference: [Angular Style Guide - Folder Structure](https://angular.dev/style-guide)
