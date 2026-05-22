---
title: Use Zoneless Async-First Testing Pattern
impact: MEDIUM
impactDescription: Modern testing approach aligned with signal-based Angular - avoids manual detectChanges
tags: testing, zoneless, async, vitest, fixture, whenStable
---

## Use Zoneless Async-First Testing Pattern

Use the "Act, Wait, Assert" pattern with `fixture.whenStable()` instead of manual `fixture.detectChanges()` calls. This aligns with modern signal-based Angular.

**Incorrect (manual change detection):**

```typescript
it('should update title', () => {
  component.title = 'New Title';
  fixture.detectChanges(); // ❌ Manual trigger
  expect(h1.textContent).toContain('New Title');
});
```

**Correct (async-first with whenStable):**

```typescript
it('should update title', async () => {
  // ACT: change state
  component.title.set('New Title');

  // WAIT: let Angular process the update
  await fixture.whenStable();

  // ASSERT: verify the DOM
  expect(h1.textContent).toContain('New Title');
});
```

### Basic Test Structure

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should display default state', async () => {
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1').textContent)
      .toContain('Default');
  });

  it('should react to input changes', async () => {
    fixture.componentRef.setInput('name', 'Test');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Test');
  });
});
```

### Key Principles

- **Never** use `fixture.detectChanges()` for triggering updates
- **Always** `await fixture.whenStable()` after state changes
- Use `fixture.componentRef.setInput()` for setting signal inputs
- Use `fixture.nativeElement` or `fixture.debugElement.query(By.css(...))` for DOM queries
- Prefer Vitest over Karma for modern Angular projects
