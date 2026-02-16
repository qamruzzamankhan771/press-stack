import * as cheerio from 'cheerio';
import { optimizeSEO } from './seoOptimizer';
import { optimizeAccessibility } from './accessibilityOptimizer';
import { generateFields } from './fieldGenerator';
import { generatePHP, TemplateKind } from './phpGenerator';
import { generateACF } from './acfGenerator';
import { extractLayout } from './modules/theme/layoutExtractor';
import { ensureThemeShell } from './modules/theme/themeShellGenerator';
import { registerAssets } from './modules/assetRegistry';

export interface CompilationResult {
    php: string;
    acf: any;
    model: any[];
    optimizedHtml: string;
    assets: string[];
    headerExtracted: boolean;
    footerExtracted: boolean;
    reports: {
        seo: any;
        accessibility: any;
    };
}

/**
 * Determines TemplateKind based on slug and templateType
 */
function determineTemplateKind(slug: string, templateType: 'full-page' | 'section'): TemplateKind {
    if (templateType === 'section') {
        return 'section';
    }

    // WordPress hierarchy template patterns
    const hierarchyPatterns = [
        'single-', 'archive-', 'category-', 'tag-', 'author-',
        'date-', 'search', 'index', 'front-page', 'home', '404'
    ];

    const normalizedSlug = slug.toLowerCase();
    const isHierarchy = hierarchyPatterns.some(pattern =>
        normalizedSlug === pattern || normalizedSlug.startsWith(pattern)
    );

    return isHierarchy ? 'hierarchy' : 'custom';
}

/**
 * Press Stack Engine v3.3.2 - Unified Compiler Architecture
 * THE non-bypassable entry point for production and test environments.
 */
export const compileHTML = (
    inputHTML: string,
    templateName: string = 'Generated Template',
    templateSlug: string = 'generated-template',
    templateType: 'full-page' | 'section' = 'full-page',
    projectId?: string
): CompilationResult => {
    let headerExtracted = false;
    let footerExtracted = false;

    // 1. Initial Parse (Full HTML) to capture Head + Body assets
    const $ = cheerio.load(inputHTML);

    // 2. Asset Transformation (Rewrite static paths for WP)
    const assetResults = transformAssets($);

    // Phase 3C: Asset Registry (Physical Copy + Enqueue)
    if (projectId) {
        registerAssets(projectId, assetResults);
    }

    // Update htmlToProcess with the rewritten paths
    // specialized check: if we started with full html, use it. 
    // If input was partial, $.html() returns it wrapped? Cheerio usually adds html/head/body if missing?
    // transformAssets works on $. 
    let htmlToProcess = $.html();

    // 3. Global Layout Extraction (Conditional)
    if (templateType !== 'section' && projectId) {
        const layout = extractLayout(htmlToProcess, projectId);
        htmlToProcess = layout.strippedHtml;
        headerExtracted = !!layout.headerContent;
        footerExtracted = !!layout.footerContent;

        // Phase 3B: Ensure Theme Shell exists (idempotent)
        ensureThemeShell(projectId);
    }

    // 4. Re-load Cheerio with the processed (potentially stripped) HTML
    // We reload to ensure we are working on the clean body content for the rest of the pipeline
    const $processing = cheerio.load(htmlToProcess);

    // 5. Hard Structural Normalization (Pre-Optimization)
    if (templateType !== 'section') {
        normalizeStructuralLandmarks($processing);
    }
    flattenRedundantWrappers($processing);

    // 6. Execution Pipeline (Order is critical)
    const seoReport = optimizeSEO($processing);
    const accReport = optimizeAccessibility($processing);

    // Note: transformAssets already ran on the full HTML. 
    // The stripped HTML already contains rewritten paths.
    // We do NOT run it again to avoid double-processing or "<?php" checks.

    // 7. Semantic Naming & Field Extraction
    const fields = generateFields($processing);

    // 8. Determine TemplateKind and Generate PHP
    const templateKind = determineTemplateKind(templateSlug, templateType);
    const php = generatePHP($processing.html(), fields, templateName, templateKind);
    const acf = generateACF(fields, templateName);

    // 9. Sanity Pass & Hard Validation
    performHardValidation($processing, fields);

    return {
        php,
        acf,
        model: fields,
        optimizedHtml: $processing.html(),
        assets: assetResults,
        headerExtracted,
        footerExtracted,
        reports: {
            seo: seoReport.report,
            accessibility: accReport.report
        }
    };
};

/**
 * PRIVATE: Asset Transformation
 * Detects local assets (src/href) and rewrites them to WP-relative paths.
 */
function transformAssets($: cheerio.CheerioAPI): string[] {
    const assets: string[] = [];
    const wpBase = "<?php echo get_template_directory_uri(); ?>/assets/";

    // 1. Process Images
    $('img').each((_, el) => {
        const $el = $(el);
        const src = $el.attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('<?php')) {
            const fileName = src.split('/').pop();
            if (fileName) {
                assets.push(src);
                $el.attr('src', wpBase + fileName);
            }
        }
    });

    // 2. Process Scripts
    $('script[src]').each((_, el) => {
        const $el = $(el);
        const src = $el.attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('<?php')) {
            const fileName = src.split('/').pop();
            if (fileName) {
                assets.push(src);
                $el.attr('src', wpBase + 'js/' + fileName);
            }
        }
    });

    // 3. Process Stylesheets (if local)
    $('link[rel="stylesheet"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('<?php')) {
            const fileName = href.split('/').pop();
            if (fileName) {
                assets.push(href);
                $el.attr('href', wpBase + 'css/' + fileName);
            }
        }
    });

    return [...new Set(assets)]; // Unique paths discovered
}

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
