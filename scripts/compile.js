/**
 * Compiles individual rule files into AGENTS.md
 * 
 * Usage: node scripts/compile.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { glob } = require('glob');

const SKILL_DIR = path.join(__dirname, '..', 'skills', 'angular-best-practices');
const RULES_DIR = path.join(SKILL_DIR, 'rules');
const OUTPUT_FILE = path.join(SKILL_DIR, 'AGENTS.md');

// Section order and metadata
const SECTIONS = [
    { prefix: 'cd-', name: 'Change Detection', number: 1, impact: 'CRITICAL' },
    { prefix: 'bundle-', name: 'Bundle Size Optimization', number: 2, impact: 'CRITICAL' },
    { prefix: 'template-', name: 'Template Performance', number: 3, impact: 'HIGH' },
    { prefix: 'rxjs-', name: 'RxJS & Async Operations', number: 4, impact: 'HIGH' },
    { prefix: 'component-', name: 'Component Architecture', number: 5, impact: 'MEDIUM-HIGH' },
    { prefix: 'http-', name: 'HTTP & Data Fetching', number: 6, impact: 'MEDIUM' },
    { prefix: 'forms-', name: 'Forms & Validation', number: 7, impact: 'MEDIUM' },
    { prefix: 'testing-', name: 'Testing & Debugging', number: 8, impact: 'LOW-MEDIUM' }
];

async function compileRules() {
    const metadata = JSON.parse(fs.readFileSync(path.join(SKILL_DIR, 'metadata.json'), 'utf8'));
    
    let output = `# Angular Best Practices

**Version ${metadata.version}**  
${metadata.organization}  
${metadata.date}

> **Note:**  
> This document is primarily for agents and LLMs to follow when maintaining,  
> generating, or refactoring Angular application code. Humans  
> may also find it useful, but guidance here is optimized for automation  
> and consistency by AI-assisted workflows.

---

## Abstract

${metadata.abstract}

---

## Table of Contents

`;

    // First pass: collect all rules and build TOC
    const allRules = [];
    
    for (const section of SECTIONS) {
        const files = await glob(`${section.prefix}*.md`, { cwd: RULES_DIR });
        const rules = [];
        
        for (const file of files.sort()) {
            const content = fs.readFileSync(path.join(RULES_DIR, file), 'utf8');
            const { data, content: body } = matter(content);
            rules.push({ file, data, body });
        }
        
        allRules.push({ section, rules });
        
        // Add to TOC
        if (rules.length > 0) {
            output += `${section.number}. [${section.name}](#${section.number}-${section.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}) — **${section.impact}**\n`;
            rules.forEach((rule, index) => {
                const ruleNumber = `${section.number}.${index + 1}`;
                const anchor = rule.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                output += `   - ${ruleNumber} [${rule.data.title}](#${ruleNumber.replace('.', '')}-${anchor})\n`;
            });
        }
    }

    output += '\n---\n\n';

    // Second pass: add full content
    for (const { section, rules } of allRules) {
        if (rules.length === 0) continue;
        
        output += `## ${section.number}. ${section.name}\n\n`;
        output += `**Impact: ${section.impact}**\n\n`;
        
        // Add section description from _sections.md if available
        try {
            const sectionsContent = fs.readFileSync(path.join(RULES_DIR, '_sections.md'), 'utf8');
            const sectionMatch = sectionsContent.match(new RegExp(`## ${section.number}\\. [^\\n]+\\n+\\*\\*Impact:\\*\\* [^\\n]+\\n+\\*\\*Description:\\*\\* ([^\\n]+)`, 'i'));
            if (sectionMatch) {
                output += `${sectionMatch[1]}\n\n`;
            }
        } catch (e) {
            // _sections.md not found, skip
        }

        rules.forEach((rule, index) => {
            const ruleNumber = `${section.number}.${index + 1}`;
            output += `### ${ruleNumber} ${rule.data.title}\n\n`;
            output += `**Impact: ${rule.data.impact}${rule.data.impactDescription ? ` (${rule.data.impactDescription})` : ''}**\n\n`;
            output += rule.body.trim() + '\n\n';
        });

        output += '---\n\n';
    }

    // Add references
    output += `## References

- [Angular Documentation](https://angular.dev)
- [Angular Performance Best Practices](https://angular.dev/best-practices/runtime-performance)
- [Angular Style Guide](https://angular.dev/style-guide)
- [RxJS Documentation](https://rxjs.dev)
`;

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✓ Compiled ${allRules.reduce((sum, s) => sum + s.rules.length, 0)} rules to AGENTS.md`);
}

compileRules().catch(console.error);
