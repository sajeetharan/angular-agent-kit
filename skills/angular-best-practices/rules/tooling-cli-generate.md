---
title: Use Angular CLI for Code Generation and Dependencies
impact: MEDIUM
impactDescription: Ensures consistent scaffolding, proper configuration, and runs schematics
tags: tooling, cli, ng-generate, ng-add, scaffolding
---

## Use Angular CLI for Code Generation and Dependencies

Always use `ng generate` for scaffolding and `ng add` for Angular libraries instead of manual file creation or `npm install`.

**Incorrect (manual file creation or npm install):**

```bash
# ❌ npm install misses schematic setup
npm install @angular/material

# ❌ Manually creating component file
touch src/app/user/user.component.ts
```

**Correct (using Angular CLI):**

```bash
# ✅ ng add runs schematics (configures angular.json, providers, etc.)
ng add @angular/material
ng add tailwindcss
ng add @angular/ssr

# ✅ ng generate creates all related files with proper structure
ng g c path/to/user          # component
ng g s path/to/user          # service
ng g d path/to/highlight     # directive
ng g p path/to/format        # pipe
ng g g path/to/auth          # guard
ng g interceptor path/to/api # interceptor
ng g environments            # environment files
```

### After Generation

Always run `ng build` to verify no errors after generating code:

```bash
ng build
```

### Development Server

```bash
ng serve  # starts dev server with HMR
```

### Updating Angular

```bash
ng update @angular/core @angular/cli
```

This runs automatic code migrations that update deprecated APIs.

### Key Rules

- **Use `ng add`** over `npm install` for Angular packages (runs schematics)
- **Use `ng generate`** over manual file creation (ensures proper module/config updates)
- **Use `ng update`** over manual version bumps (runs migrations)
- **Note the output path** from generate commands to know where files were created
