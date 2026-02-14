import * as cheerio from 'cheerio';
import { optimizeSEO } from './seoOptimizer';
import { optimizeAccessibility } from './accessibilityOptimizer';
import { generateFields } from './fieldGenerator';
import { generatePHP } from './phpGenerator';
import { generateACF } from './acfGenerator';

export interface CompilationResult {
    php: string;
    acf: any;
    model: any[];
    optimizedHtml: string;
    reports: {
        seo: any;
        accessibility: any;
    };
}

/**
 * Press Stack Engine v3.3.1 - Unified Compiler Architecture
 * THE non-bypassable entry point for production and test environments.
 */
export const compileHTML = (
    inputHTML: string,
    templateName: string = 'Generated Template',
    includeTemplateHeader: boolean = true
): CompilationResult => {
    // 1. Initial Parse
    const $ = cheerio.load(inputHTML);

    // 2. Hard Structural Normalization (Pre-Optimization)
    normalizeStructuralLandmarks($);
    flattenRedundantWrappers($);

    // 3. Execution Pipeline (Order is critical)
    const seoReport = optimizeSEO($);
    const accReport = optimizeAccessibility($);

    // 4. Semantic Naming & Field Extraction
    const fields = generateFields($);

    // 5. PHP Injection & ACF Generation
    const php = generatePHP($.html(), fields, templateName, includeTemplateHeader);
    const acf = generateACF(fields, templateName);

    // 6. Sanity Pass & Hard Validation
    performHardValidation($, fields);

    return {
        php,
        acf,
        model: fields,
        optimizedHtml: $.html(),
        reports: {
            seo: seoReport.report,
            accessibility: accReport.report
        }
    };
};

/**
 * PRIVATE: Landmark Normalization
 * Ensures only ONE <main> exists and landmarks are top-level or semantic.
 */
function normalizeStructuralLandmarks($: cheerio.CheerioAPI) {
    const mains = $('main').toArray();
    if (mains.length > 1) {
        // Keep only the first <main>, convert others to <div>
        mains.slice(1).forEach(m => {
            const $m = $(m);
            $m.replaceWith(`<div>${$m.html()}</div>`);
        });
    }

    if ($('main').length === 0) {
        const bodyContent = $('body').html() || $.root().html();
        if (bodyContent) {
            const $main = $('<main id="main-content"></main>').append(bodyContent);
            if ($('body').length > 0) {
                $('body').empty().append($main);
            } else {
                $.root().empty().append($main);
            }
        }
    }
}

/**
 * PRIVATE: Flatten Redundant Wrappers
 * Aggressively collapse generic empty/single-child <div> elements.
 */
function flattenRedundantWrappers($: cheerio.CheerioAPI) {
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 10) {
        changed = false;
        $('div').toArray().reverse().forEach(el => {
            const $el = $(el);
            if ($el.attr('id') || $el.attr('class') || $el.attr('style')) return;

            const directText = $(el).contents().filter((_, n) => n.nodeType === 3 && $(n).text().trim().length > 0).length > 0;
            if (directText) return;

            if ($el.children().length === 0) {
                $el.remove();
                changed = true;
            } else if ($el.children().length === 1) {
                $el.replaceWith($el.children().first());
                changed = true;
            }
        });
        iterations++;
    }
}

/**
 * PRIVATE: Hard Validation Rules
 * Throws errors on critical semantic failures.
 */
function performHardValidation($: cheerio.CheerioAPI, fields: any[]) {
    // Rule 1: Single Main
    if ($('main').length > 1) {
        throw new Error('COMPILER_FATAL: Multiple <main> landmarks detected after normalization.');
    }

    // Rule 2: Single H1
    if ($('h1').length > 1) {
        throw new Error('COMPILER_FATAL: Multiple <h1> headings remains after SEO optimization.');
    }

    // Rule 3: No Clickable Divs
    if ($('div[onclick], span[onclick], p[onclick]').length > 0) {
        throw new Error('COMPILER_FATAL: Non-semantic clickable primitives remains after Accessibility pass.');
    }

    // Rule 4: Field Collision
    const slugs = new Set();
    const checkCollisions = (fieldList: any[]) => {
        fieldList.forEach(f => {
            if (slugs.has(f.id)) throw new Error(`COMPILER_FATAL: Field ID collision detected for ${f.slug}.`);
            slugs.add(f.id);
            if (f.children) checkCollisions(f.children);
        });
    };
    checkCollisions(fields);
}
