# 1. Change Detection (cd)

**Impact:** CRITICAL  
**Description:** Change detection strategy is foundational to Angular performance. Poor change detection causes excessive re-renders, memory leaks, and sluggish UI. OnPush strategy combined with immutable data patterns yields the largest performance gains.

## 2. Bundle Size Optimization (bundle)

**Impact:** CRITICAL  
**Description:** Bundle size directly impacts initial load time and Time to Interactive. Lazy loading, tree shaking, and standalone components reduce initial payload and improve Core Web Vitals.

## 3. Template Performance (template)

**Impact:** HIGH  
**Description:** Template expressions run on every change detection cycle. Function calls in templates, missing trackBy, and inefficient structural directives cause performance degradation that compounds with component complexity.

## 4. RxJS & Async Operations (rxjs)

**Impact:** HIGH  
**Description:** Proper RxJS usage prevents memory leaks, race conditions, and unnecessary API calls. Correct operator choice and subscription management are essential for reactive Angular applications.

## 5. Component Architecture (component)

**Impact:** MEDIUM-HIGH  
**Description:** Well-structured components with clear separation of concerns improve maintainability, testability, and enable better change detection optimization.

## 6. HTTP & Data Fetching (http)

**Impact:** MEDIUM  
**Description:** Efficient HTTP handling with interceptors, caching, and proper error handling improves both performance and user experience.

## 7. Forms & Validation (forms)

**Impact:** MEDIUM  
**Description:** Reactive forms with typed controls and efficient validation improve developer experience and prevent runtime errors.

## 8. Testing & Debugging (testing)

**Impact:** LOW-MEDIUM  
**Description:** Proper testing patterns ensure maintainability and catch regressions early. Performance profiling helps identify bottlenecks.
