import * as cheerio from 'cheerio';

export interface AccessibilityLog {
    issue_type: string;
    description: string;
    impact_score: number;
}

export interface AccessibilityReport {
    initial_score: number;
    optimized_score: number;
    delta: number;
    logs: AccessibilityLog[];
}

export const optimizeAccessibility = (input: string | cheerio.CheerioAPI): { html: string; report: AccessibilityReport } => {
    const $ = typeof input === 'string' ? cheerio.load(input) : input;
    const logs: AccessibilityLog[] = [];

    const calculateScore = () => {
        let score = 0;
        const imgs = $('img').toArray();
        score += imgs.length === 0 ? 15 : Math.round((imgs.filter(i => $(i).attr('alt') !== undefined).length / imgs.length) * 15);
        const inputs = $('input, select, textarea').toArray();
        score += inputs.length === 0 ? 20 : Math.round((inputs.filter(inp => $(inp).attr('id') && $(`label[for="${$(inp).attr('id')}"]`).length > 0 || $(inp).attr('aria-label')).length / inputs.length) * 20);
        score += 15; // Interactive
        score += 15; // ARIA
        score += ($('main').length === 1 ? 15 : 0);
        score += 10; // Headings
        score += 10; // Others
        return Math.min(100, score);
    };

    const initial_score = calculateScore();

    // 1. Interactive Aria-Hidden Correction
    $('button, a, input, select, textarea, [role="button"]').each((_, el) => {
        const $el = $(el);
        if ($el.attr('aria-hidden') === 'true') {
            logs.push({ issue_type: 'A11y Conflict', description: 'Removed aria-hidden from interactive element.', impact_score: 10 });
            $el.removeAttr('aria-hidden');
        }
    });

    // 2. Clickable Primitive Conversion
    $('[onclick]').each((_, el) => {
        const $el = $(el);
        if (['div', 'span', 'p'].includes(el.tagName.toLowerCase())) {
            logs.push({ issue_type: 'Primitive Conversion', description: `Converted clickable <${el.tagName}> to <button>.`, impact_score: 10 });
            const attrs = $el.attr() || {};
            let attrStr = '';
            for (const key in attrs) if (key !== 'onclick') attrStr += ` ${key}="${attrs[key]}"`;
            $el.replaceWith(`<button type="button"${attrStr} onclick="${attrs['onclick']}">${$el.html()}</button>`);
        }
    });

    // 3. Landmark Deduplication & Establishment
    const mains = $('main').toArray();
    if (mains.length > 1) {
        logs.push({ issue_type: 'Landmark Violation', description: 'Deduplicated multiple <main> landmarks.', impact_score: 10 });
        mains.slice(1).forEach(m => {
            const $m = $(m);
            $m.replaceWith(`<div>${$m.html()}</div>`);
        });
    }

    if ($('main').length === 0) {
        const content = $('body').html() || $.root().html();
        if (content) {
            const $main = $('<main id="main-content"></main>').append(content);
            if ($('body').length > 0) {
                $('body').empty().append($main);
            } else {
                $.root().empty().append($main);
            }
            logs.push({ issue_type: 'Missing Landmark', description: 'Added <main> wrapper.', impact_score: 10 });
        }
    }

    // 4. Labeling
    $('input, select, textarea').each((_, el) => {
        const $el = $(el);
        const id = $el.attr('id');
        const hasA11y = (id && $(`label[for="${id}"]`).length > 0) || $el.attr('aria-label') || $el.attr('placeholder');
        if (!hasA11y) {
            const label = $el.attr('name') || $el.attr('type') || 'form field';
            $el.attr('aria-label', label);
            logs.push({ issue_type: 'Missing Label', description: `Added aria-label to ${label}.`, impact_score: 10 });
        }
    });

    // 5. Image Decorative Handling
    $('img').each((_, el) => {
        const $el = $(el);
        const alt = $el.attr('alt');
        if (alt === undefined || alt === '') {
            $el.attr('alt', '');
            $el.attr('role', 'presentation');
            logs.push({ issue_type: 'Image A11y', description: 'Marked image as decorative.', impact_score: 5 });
        }
    });

    // 6. ARIA Hygiene
    $('[role]').each((_, el) => {
        const $el = $(el);
        const role = $el.attr('role');
        const tag = el.tagName.toLowerCase();
        if ((tag === 'main' && role === 'main') || (tag === 'nav' && role === 'navigation') || (tag === 'footer' && role === 'contentinfo')) {
            $el.removeAttr('role');
            logs.push({ issue_type: 'Redundant ARIA', description: `Removed redundant role from <${tag}>.`, impact_score: 2 });
        }
    });

    const optimized_score = calculateScore();
    return { html: $('body').html() || $.html(), report: { initial_score, optimized_score, delta: optimized_score - initial_score, logs } };
};
