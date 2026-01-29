---
title: Use Standalone Components
impact: CRITICAL
impactDescription: smaller bundles, better tree-shaking, simpler architecture
tags: bundle, standalone, components, modern-angular
---

## Use Standalone Components

Use standalone components, directives, and pipes instead of NgModules. Standalone APIs enable better tree-shaking and simpler mental models.

**Incorrect (NgModule-based - harder to tree-shake):**

```typescript
// shared.module.ts
@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    TooltipDirective,
    DateFormatPipe,
    // 50 more components...
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    TooltipDirective,
    DateFormatPipe,
    // 50 more exports...
  ]
})
export class SharedModule {}

// feature.component.ts
@Component({
  selector: 'app-feature',
  template: `<app-button>Click</app-button>`
})
export class FeatureComponent {}

// feature.module.ts
@NgModule({
  imports: [SharedModule], // Imports ALL 50 components!
  declarations: [FeatureComponent]
})
export class FeatureModule {}
```

**Correct (standalone - import only what you use):**

```typescript
// button.component.ts
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [class]="variant()">
      <ng-content />
    </button>
  `
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary'>('primary');
}

// card.component.ts
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <ng-content />
    </div>
  `
})
export class CardComponent {}

// feature.component.ts - imports only what it needs
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [ButtonComponent], // Only ButtonComponent is bundled!
  template: `<app-button>Click</app-button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureComponent {}
```

**Standalone pipes and directives:**

```typescript
// date-format.pipe.ts
@Pipe({
  name: 'dateFormat',
  standalone: true,
  pure: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date, format: string): string {
    return formatDate(value, format, 'en-US');
  }
}

// tooltip.directive.ts
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  text = input.required<string>({ alias: 'appTooltip' });
}

// Usage
@Component({
  standalone: true,
  imports: [DateFormatPipe, TooltipDirective],
  template: `
    <span [appTooltip]="'More info'">
      {{ date | dateFormat:'short' }}
    </span>
  `
})
export class InfoComponent {
  date = new Date();
}
```

**Bootstrap standalone application:**

```typescript
// main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ]
});

// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <router-outlet />
  `
})
export class AppComponent {}
```

Reference: [Angular Standalone Components](https://angular.dev/guide/components/importing)
