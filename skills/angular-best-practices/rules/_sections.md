# 1. Signals & Reactivity (signals)

**Impact:** CRITICAL  
**Description:** Signals are the foundation of modern Angular reactivity. Use `signal()`, `computed()`, `linkedSignal()`, and `resource()` for state management. Effects should only be used for side effects (logging, localStorage), never for state propagation.

## 2. Change Detection (cd)

**Impact:** CRITICAL  
**Description:** Change detection strategy is foundational to Angular performance. Poor change detection causes excessive re-renders, memory leaks, and sluggish UI. OnPush strategy combined with immutable data patterns yields the largest performance gains.

## 3. Bundle Size Optimization (bundle)

**Impact:** CRITICAL  
**Description:** Bundle size directly impacts initial load time and Time to Interactive. Lazy loading, tree shaking, and standalone components reduce initial payload and improve Core Web Vitals.

## 4. Template Performance (template)

**Impact:** HIGH  
**Description:** Template expressions run on every change detection cycle. Function calls in templates, missing trackBy, and inefficient structural directives cause performance degradation that compounds with component complexity.

## 5. RxJS & Async Operations (rxjs)

**Impact:** HIGH  
**Description:** Proper RxJS usage prevents memory leaks, race conditions, and unnecessary API calls. Correct operator choice and subscription management are essential for reactive Angular applications.

## 6. Component Architecture (component)

**Impact:** HIGH  
**Description:** Well-structured components with clear separation of concerns improve maintainability, testability, and enable better change detection optimization. Use signal-based inputs/outputs for modern reactivity.

## 7. Dependency Injection (di)

**Impact:** HIGH  
**Description:** Use the modern `inject()` function over constructor injection for cleaner, tree-shakeable services. Prefer `providedIn: 'root'` for singleton services.

## 8. Routing & Navigation (routing)

**Impact:** MEDIUM  
**Description:** Use functional route guards, choose appropriate rendering strategies (CSR/SSR/SSG), and implement lazy loading for optimal navigation performance and SEO.

## 9. HTTP & Data Fetching (http)

**Impact:** MEDIUM  
**Description:** Efficient HTTP handling with interceptors, caching, and proper error handling improves both performance and user experience.

## 10. Forms & Validation (forms)

**Impact:** MEDIUM  
**Description:** Use Signal Forms for Angular v21+ apps. For older apps, use reactive forms with typed controls and efficient validation.

## 11. Accessibility (a11y)

**Impact:** MEDIUM  
**Description:** Use `@angular/aria` directives for headless, WAI-ARIA compliant components with proper keyboard navigation, focus management, and screen reader support.

## 12. Testing & Debugging (testing)

**Impact:** MEDIUM  
**Description:** Use zoneless async-first testing with `fixture.whenStable()`. Proper testing patterns ensure maintainability and catch regressions early.

## 13. Tooling (tooling)

**Impact:** MEDIUM  
**Description:** Use Angular CLI (`ng generate`, `ng add`, `ng update`) for consistent scaffolding, dependency management, and automatic code migrations.
