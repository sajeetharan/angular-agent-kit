# Contributing to angular-agent-kit

Thank you for your interest in contributing! This project is a collection of skills for AI coding agents working with Angular.

## Ways to Contribute

### 1. Add New Rules (Most Common)

Add new best practice rules to the existing `angular-best-practices` skill:

1. Create a new rule file in `skills/angular-best-practices/rules/`
2. Follow the naming convention: `{prefix}-{description}.md`
   - Use an existing prefix that matches the category (e.g., `cd-`, `bundle-`, `template-`)
3. Use the template at `skills/angular-best-practices/rules/_template.md`
4. Include valid frontmatter with `title`, `impact`, and `tags`
5. Run `npm run build` to compile rules into AGENTS.md

**Example rule file name:** `cd-trackby-functions.md`

### 2. Improve Existing Rules

- Review and enhance rule content for clarity or accuracy
- Add missing examples or edge cases
- Update rules as Angular evolves
- Fix typos or grammatical errors

### 3. Create a New Skill

For advanced contributors, create an entirely new skill following the structure in [AGENTS.md](AGENTS.md):

```
skills/
  {skill-name}/           # kebab-case directory name
    SKILL.md              # Required: skill definition
    AGENTS.md             # Required: compiled rules (generated)
    metadata.json         # Required: version and metadata
    README.md             # Required: documentation
    rules/                # Required for rule-based skills
      _sections.md        # Section metadata
      _template.md        # Template for new rules
      {prefix}-{name}.md  # Individual rule files
```

### 4. Report Issues / Suggest Improvements

- Open GitHub issues for bugs, inaccuracies, or missing best practices
- Suggest new rule categories or skill ideas
- Share feedback on rule effectiveness

### 5. Test Compatibility

- Test skills with different AI agents (Claude Code, GitHub Copilot, Gemini CLI, Cursor)
- Report compatibility issues or unexpected behavior

## Getting Started

```bash
# Clone the repo
git clone https://github.com/sajeetharan/angular-agent-kit.git
cd angular-agent-kit

# Install dependencies
npm install

# Make changes to rules, then build
npm run build

# Validate your changes
npm run validate
```

## Rule File Format

Each rule file should follow this structure:

```markdown
---
title: Short descriptive title
impact: Critical | High | Medium | Low
impactDescription: Brief explanation of impact
tags:
  - relevant-tag
  - another-tag
---

## Rule Title

Brief explanation of the rule and why it matters.

**Incorrect (brief description):**

```typescript
// Anti-pattern code
```

**Correct (brief description):**

```typescript
// Best practice code
```

Reference: [Link to documentation](https://angular.dev)
```

## Pull Request Guidelines

1. **One Rule Per PR**: Keep changes focused
2. **Follow Templates**: Use existing rules as reference
3. **Include Examples**: Real code beats abstract descriptions
4. **Test Locally**: Run `npm run build` and `npm run validate`
5. **Clear Descriptions**: Explain why the change matters

## Code of Conduct

- Be respectful and constructive
- Focus on improving developer experience
- Welcome newcomers and help them contribute

## Questions?

Open a GitHub issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
