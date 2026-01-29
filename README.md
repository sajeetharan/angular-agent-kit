# angular-agent-kit

A collection of skills for AI coding agents working with Angular. Skills are packaged instructions and scripts that extend agent capabilities.

Skills follow the [Agent Skills](https://agentskills.io/) format.

## Available Skills

### angular-best-practices

Angular performance optimization guidelines containing 45+ rules across 8 categories, prioritized by impact.

**Use when:**
- Writing new Angular components or services
- Implementing change detection strategies
- Reviewing code for performance issues
- Optimizing bundle size or load times
- Working with RxJS observables and state management

**Categories covered:**
- Change Detection (Critical)
- Bundle Size Optimization (Critical)
- Template Performance (High)
- RxJS & Async Operations (High)
- Component Architecture (Medium-High)
- HTTP & Data Fetching (Medium)
- Forms & Validation (Medium)
- Testing & Debugging (Low-Medium)

## Installation

```bash
npx add-skill sajeetharan/angular-agent-kit
```

## Usage

Skills are automatically available once installed. The agent will use them when relevant tasks are detected.

**Examples:**
```
Review my Angular component for performance issues
```
```
Help me optimize change detection in this component
```
```
Optimize this Angular template for better performance
```

## Skill Structure

Each skill contains:
- `SKILL.md` - Instructions for the agent (triggers activation)
- `AGENTS.md` - Compiled rules (what agents read)
- `rules/` - Individual rule files
- `metadata.json` - Version and metadata

## Compatibility

Works with Claude Code, GitHub Copilot, Gemini CLI, Cursor, and other Agent Skills-compatible tools.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT

## Acknowledgments

- Inspired by [Vercel's React Best Practices](https://vercel.com/blog/introducing-react-best-practices)
- Based on the [Agent Skills](https://agentskills.io) specification
- Angular team for [official documentation](https://angular.dev)
