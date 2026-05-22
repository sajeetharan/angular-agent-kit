---
title: Use Angular Aria for Accessible Components
impact: MEDIUM
impactDescription: Provides WAI-ARIA compliant keyboard, focus, and screen reader support out of the box
tags: accessibility, aria, a11y, keyboard, screen-reader
---

## Use Angular Aria for Accessible Components

Use `@angular/aria` directives to build headless, accessible components that implement WAI-ARIA patterns (Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid).

**Incorrect (manually implementing keyboard/ARIA logic):**

```typescript
@Component({
  template: `
    <div role="tablist">
      <button role="tab" [attr.aria-selected]="active === 0"
              (click)="active = 0" (keydown)="handleKeydown($event, 0)">Tab 1</button>
      <button role="tab" [attr.aria-selected]="active === 1"
              (click)="active = 1" (keydown)="handleKeydown($event, 1)">Tab 2</button>
    </div>
  `
})
export class TabsComponent {
  active = 0;
  // Must manually implement arrow key navigation, focus management, ARIA attributes...
  handleKeydown(event: KeyboardEvent, index: number) { /* complex logic */ }
}
```

**Correct (using @angular/aria):**

```typescript
import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';

@Component({
  selector: 'app-faq',
  imports: [AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger],
  template: `
    <div ngAccordionGroup [multiExpandable]="false">
      <div class="accordion-item">
        <button ngAccordionTrigger panelId="panel-1">Section 1</button>
        <div ngAccordionPanel panelId="panel-1">
          <ng-template ngAccordionContent>
            <p>Lazy loaded content.</p>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class FaqComponent {}
```

### Styling Headless Components

Style different states using ARIA attributes the directives set automatically:

```css
.accordion-header[aria-expanded='true'] .icon {
  transform: rotate(180deg);
}

[aria-selected='true'] {
  border-bottom: 2px solid var(--primary);
}

[aria-disabled='true'] {
  opacity: 0.5;
  pointer-events: none;
}
```

### Available Patterns

- **Accordion**: Expandable/collapsible sections
- **Listbox**: Visible selection lists
- **Combobox**: Input with dropdown suggestions
- **Menu**: Action menus with keyboard nav
- **Tabs**: Tabbed content panels
- **Toolbar**: Groups of action buttons
- **Tree**: Hierarchical data navigation
- **Grid**: Data grids with cell navigation

### Setup

```bash
npm install @angular/aria
```
