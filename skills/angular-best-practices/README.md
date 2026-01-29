# angular-best-practices

Angular best practices for AI coding agents, following the [Agent Skills](https://agentskills.io) specification.

## Overview

This skill contains 45+ rules across 8 categories, ordered by impact:

| Category | Impact | Description |
|----------|--------|-------------|
| Change Detection | CRITICAL | OnPush strategy, trackBy, zone optimization |
| Bundle Size Optimization | CRITICAL | Lazy loading, tree shaking, standalone components |
| Template Performance | HIGH | Avoid function calls, async pipe, control flow |
| RxJS & Async Operations | HIGH | Subscription management, operators, signals |
| Component Architecture | MEDIUM-HIGH | Smart/presentational, composition, inputs/outputs |
| HTTP & Data Fetching | MEDIUM | Interceptors, caching, error handling |
| Forms & Validation | MEDIUM | Reactive forms, typed forms, validators |
| Testing & Debugging | LOW-MEDIUM | Component harnesses, async testing, profiling |

## Installation

### Using skills CLI (Recommended)

```bash
npx skills add sajeetharan/angular-agent-kit
```

This installs the skill into your `.copilot/skills/` directory.

### Manual Installation

Clone this repository and copy the skill:

```bash
git clone https://github.com/sajeetharan/angular-agent-kit.git
cp -r angular-agent-kit/skills/angular-best-practices ~/.copilot/skills/
```

### Claude Code

```bash
cp -r skills/angular-best-practices ~/.claude/skills/
```

## File Structure

```
skills/angular-best-practices/
├── SKILL.md              # Skill definition (triggers agent activation)
├── AGENTS.md             # Compiled rules (what agents read)
├── metadata.json         # Version and metadata
├── README.md             # This file
└── rules/
    ├── _sections.md      # Section definitions
    ├── _template.md      # Template for new rules
    ├── cd-*.md           # Change detection rules (6)
    ├── bundle-*.md       # Bundle optimization rules (6)
    ├── template-*.md     # Template performance rules (6)
    ├── rxjs-*.md         # RxJS rules (6)
    ├── component-*.md    # Component architecture rules (6)
    ├── http-*.md         # HTTP rules (6)
    ├── forms-*.md        # Forms rules (6)
    └── testing-*.md      # Testing rules (6)
```

## How It Works

When you're working on Angular code, AI coding agents (Claude Code, GitHub Copilot, Gemini CLI, etc.) that support Agent Skills will automatically:

1. Detect the skill based on `SKILL.md` triggers
2. Load `AGENTS.md` rules into context
3. Apply best practices while generating or reviewing code

## Compiling Rules

To rebuild `AGENTS.md` from individual rules:

```bash
npm run build
# or
node scripts/compile.js
```

## Contributing

### Adding a New Rule

1. Copy `rules/_template.md` to a new file in the appropriate category
2. Fill in the frontmatter (title, impact, impactDescription, tags)
3. Add Incorrect and Correct code examples
4. Run `npm run build` to recompile AGENTS.md
5. Submit a pull request

### Rule Format

```markdown
---
title: Rule Title
impact: HIGH
impactDescription: Brief explanation of why this matters
tags: [relevant, tags, here]
---

**Incorrect (brief reason):**

```typescript
// Anti-pattern code
```

**Correct (brief reason):**

```typescript
// Best practice code
```
```

### Impact Levels

- **CRITICAL**: Prevents major performance issues or blocking problems
- **HIGH**: Significant performance or maintainability impact
- **MEDIUM-HIGH**: Notable optimization opportunity
- **MEDIUM**: Recommended best practice
- **LOW-MEDIUM**: Nice to have
- **LOW**: Minor optimization

## Compatibility

This skill follows the [Agent Skills](https://agentskills.io) open standard and is compatible with:

- Claude Code
- VS Code (GitHub Copilot)
- GitHub.com
- Gemini CLI
- OpenCode
- Factory
- OpenAI Codex
- Cursor

## License

MIT

## Acknowledgments

- Inspired by [Vercel's React Best Practices](https://vercel.com/blog/introducing-react-best-practices)
- Based on the [Agent Skills](https://agentskills.io) specification
- Angular team for [official documentation](https://angular.dev)
- [Azure Cosmos DB Agent Kit](https://github.com/AzureCosmosDB/cosmosdb-agent-kit) for structure reference
