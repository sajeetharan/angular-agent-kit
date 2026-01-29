---
title: Use NgOptimizedImage for Images
impact: HIGH
impactDescription: automatic lazy loading, prevents layout shift, optimized loading
tags: template, images, performance, core-web-vitals
---

## Use NgOptimizedImage for Images

Use Angular's `NgOptimizedImage` directive for all images. It automatically implements best practices like lazy loading, priority hints, and prevents Cumulative Layout Shift (CLS).

**Incorrect (standard img - no optimization):**

```html
<!-- No lazy loading, causes layout shift, no priority -->
<img src="/assets/hero.jpg" alt="Hero image">

<!-- Manual lazy loading, but no width/height -->
<img src="/assets/photo.jpg" loading="lazy" alt="Photo">

<!-- Hardcoded dimensions in styles -->
<img src="/assets/product.jpg" style="width: 300px; height: 200px" alt="Product">
```

**Correct (NgOptimizedImage - fully optimized):**

```typescript
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <!-- LCP image - load with priority -->
    <img 
      ngSrc="/assets/hero.jpg" 
      width="1200" 
      height="600" 
      priority
      alt="Hero banner"
    />

    <!-- Regular images - lazy loaded by default -->
    <img 
      ngSrc="/assets/product.jpg" 
      width="300" 
      height="200" 
      alt="Product image"
    />

    <!-- Fill mode for responsive containers -->
    <div class="image-container">
      <img 
        ngSrc="/assets/background.jpg" 
        fill
        alt="Background"
      />
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      width: 100%;
      height: 400px;
    }
  `]
})
export class ProductComponent {}
```

**With image loaders for CDNs:**

```typescript
// app.config.ts
import { provideImgixLoader } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideImgixLoader('https://your-site.imgix.net/')
  ]
};

// Or use other loaders
import { 
  provideCloudinaryLoader,
  provideCloudflareLoader,
  provideImageKitLoader,
  provideNetlifyLoader
} from '@angular/common';
```

**Dynamic images with srcset:**

```html
<!-- Responsive images with automatic srcset -->
<img 
  ngSrc="/products/{{ product.id }}.jpg" 
  width="400" 
  height="300"
  ngSrcset="200w, 400w, 800w"
  sizes="(max-width: 600px) 200px, (max-width: 1200px) 400px, 800px"
  [alt]="product.name"
/>
```

**Placeholder for loading state:**

```html
<!-- Blur placeholder while loading -->
<img 
  ngSrc="/assets/large-image.jpg"
  width="800"
  height="600"
  placeholder
  alt="Large image"
/>

<!-- Or provide custom placeholder -->
<img 
  ngSrc="/assets/large-image.jpg"
  width="800"
  height="600"
  [placeholder]="smallPlaceholderDataUrl"
  alt="Large image"
/>
```

**Common configuration options:**

```html
<!-- Priority for LCP images (disables lazy loading) -->
<img ngSrc="..." priority />

<!-- Disable automatic srcset generation -->
<img ngSrc="..." disableOptimizedSrcset />

<!-- Fill parent container -->
<img ngSrc="..." fill />

<!-- Custom loading behavior -->
<img ngSrc="..." loading="eager" />
```

**Best practices:**
- Always provide `width` and `height` or use `fill` mode
- Use `priority` for above-the-fold images (LCP candidates)
- Configure an image loader for your CDN
- Use appropriate `sizes` attribute for responsive images

Reference: [Angular NgOptimizedImage](https://angular.dev/guide/image-optimization)
