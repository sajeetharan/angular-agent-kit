/**
 * Validates rule files for correct structure
 * 
 * Usage: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { glob } = require('glob');

const RULES_DIR = path.join(__dirname, '..', 'skills', 'angular-best-practices', 'rules');

const VALID_IMPACTS = ['CRITICAL', 'HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW-MEDIUM', 'LOW'];

const VALID_PREFIXES = ['cd-', 'bundle-', 'template-', 'rxjs-', 'component-', 'http-', 'forms-', 'testing-'];

async function validateRules() {
    const files = await glob('*.md', { cwd: RULES_DIR });
    const ruleFiles = files.filter(f => !f.startsWith('_'));
    
    let errors = [];
    let warnings = [];
    
    for (const file of ruleFiles) {
        const filePath = path.join(RULES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        try {
            const { data, content: body } = matter(content);
            
            // Check required frontmatter
            if (!data.title) {
                errors.push(`${file}: Missing 'title' in frontmatter`);
            }
            
            if (!data.impact) {
                errors.push(`${file}: Missing 'impact' in frontmatter`);
            } else if (!VALID_IMPACTS.includes(data.impact)) {
                errors.push(`${file}: Invalid impact '${data.impact}'. Must be one of: ${VALID_IMPACTS.join(', ')}`);
            }
            
            if (!data.tags) {
                warnings.push(`${file}: Missing 'tags' in frontmatter`);
            }
            
            // Check filename prefix
            const hasValidPrefix = VALID_PREFIXES.some(prefix => file.startsWith(prefix));
            if (!hasValidPrefix) {
                errors.push(`${file}: Invalid filename prefix. Must start with one of: ${VALID_PREFIXES.join(', ')}`);
            }
            
            // Check for code examples
            if (!body.includes('```')) {
                warnings.push(`${file}: No code examples found`);
            }
            
            // Check for Incorrect/Correct pattern
            if (!body.toLowerCase().includes('incorrect') && !body.toLowerCase().includes('bad')) {
                warnings.push(`${file}: No 'Incorrect' example found`);
            }
            
            if (!body.toLowerCase().includes('correct') && !body.toLowerCase().includes('good')) {
                warnings.push(`${file}: No 'Correct' example found`);
            }
            
        } catch (e) {
            errors.push(`${file}: Failed to parse - ${e.message}`);
        }
    }
    
    // Print results
    console.log(`\nValidated ${ruleFiles.length} rule files\n`);
    
    if (errors.length > 0) {
        console.log('❌ Errors:');
        errors.forEach(e => console.log(`   ${e}`));
        console.log('');
    }
    
    if (warnings.length > 0) {
        console.log('⚠️  Warnings:');
        warnings.forEach(w => console.log(`   ${w}`));
        console.log('');
    }
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ All rule files are valid!');
    } else if (errors.length === 0) {
        console.log('✅ No errors found (but some warnings)');
    }
    
    // Exit with error code if there are errors
    if (errors.length > 0) {
        process.exit(1);
    }
}

validateRules().catch(err => {
    console.error('Validation failed:', err);
    process.exit(1);
});
