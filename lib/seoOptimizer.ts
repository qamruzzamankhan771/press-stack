import * as cheerio from 'cheerio';

export interface OptimizationLog {
    issue_type: string;
    original_structure: string;
    optimized_structure: string;
    reason: string;
    SEO_impact_score: number;
}

export interface SEOReport {
    initial_score: number;
    optimized_score: number;
    delta: number;
    logs: OptimizationLog[];
}

export const optimizeSEO = (input: string | cheerio.CheerioAPI): { html: string; report: SEOReport } => {
    const $ = typeof input === 'string' ? cheerio.load(input) : input;
    const logs: OptimizationLog[] = [];

    const calculateScore = () => {
        let score = 0;
        if ($('h1').length === 1) score += 15;
        const headings = $('h1, h2, h3, h4, h5, h6').toArray();
        let skipped = false;
        for (let i = 0; i < headings.length - 1; i++) {
            const curr = parseInt(headings[i].tagName[1]);
            const next = parseInt(headings[i + 1].tagName[1]);
            if (next > curr + 1) skipped = true;
        }
        if (!skipped && $('h1').length > 0) score += 10;
        return score;
    };

    const initial_score = calculateScore();

    // 1. Static H1 Processing
    const h1s = $('h1').toArray();
    h1s.slice(1).forEach(el => {
        logs.push({ issue_type: 'Heading Integrity', original_structure: 'excess h1', optimized_structure: 'h2', reason: 'Deduplicating H1.', SEO_impact_score: 5 });
        $(el).replaceWith(`<h2>${$(el).html()}</h2>`);
    });

    if ($('h1').length === 0) {
        const firstH2 = $('h2').first();
        if (firstH2.length) {
            logs.push({ issue_type: 'Heading Integrity', original_structure: 'no h1', optimized_structure: 'h1', reason: 'Promoting first H2.', SEO_impact_score: 10 });
            firstH2.replaceWith(`<h1>${firstH2.html()}</h1>`);
        }
    }

    // Fixed Global Heading Hierarchy
    let headingFixNeeded = true;
    while (headingFixNeeded) {
        headingFixNeeded = false;
        const allHeadings = $('h1, h2, h3, h4, h5, h6').toArray();
        for (let i = 1; i < allHeadings.length; i++) {
            const prev = allHeadings[i - 1];
            const curr = allHeadings[i];
            const prevLevel = parseInt(prev.tagName[1]);
            const currLevel = parseInt(curr.tagName[1]);
            if (currLevel > prevLevel + 1) {
                const newTag = `h${prevLevel + 1}`;
                $(curr).replaceWith(`<${newTag}>${$(curr).html()}</${newTag}>`);
                headingFixNeeded = true;
                logs.push({ issue_type: 'Hierarchy Fix', original_structure: curr.tagName, optimized_structure: newTag, reason: 'Fixing skipped level.', SEO_impact_score: 5 });
                break;
            }
        }
    }

    // 2. Bottom-Up Pruning
    let count = 0;
    let changed = true;
    while (changed && count < 5) {
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
        count++;
    }

    // 3. Anchor Integrity
    $('a[href="#"]').each((_, el) => {
        const $el = $(el);
        $el.replaceWith(`<button type="button" class="${$el.attr('class') || ''}">${$el.html()}</button>`);
    });

    // 4. Semantic Upgrades
    $('div').each((_, el) => {
        const $el = $(el);
        const tag = el.tagName.toLowerCase();
        if (tag !== 'div') return;

        const cls = ($el.attr('class') || '').toLowerCase();
        let newTag = '';
        if (cls.includes('hero')) newTag = 'section';
        else if (cls.includes('nav')) newTag = 'nav';
        else if (cls.includes('footer')) newTag = 'footer';
        else if (cls.includes('main')) newTag = 'main';

        if (newTag) {
            logs.push({ issue_type: 'Semantic Upgrade', original_structure: 'div', optimized_structure: newTag, reason: `Structural class .${cls} implies specialized tag.`, SEO_impact_score: 5 });
            const attrs = $el.attr();
            let attrStr = '';
            for (const key in attrs) attrStr += ` ${key}="${attrs[key]}"`;
            $el.replaceWith(`<${newTag}${attrStr}>${$el.html()}</${newTag}>`);
        }
    });

    // 5. Image SEO Context
    $('img').each((_, el) => {
        const $el = $(el);
        const alt = $el.attr('alt');
        if (alt === undefined) {
            const context = $el.closest('section, div, header, main').find('h1, h2, h3, h4').first().text().trim();
            if (context) {
                $el.attr('alt', context);
                logs.push({ issue_type: 'Image SEO', original_structure: 'missing alt', optimized_structure: `alt="${context}"`, reason: 'Contextual alt.', SEO_impact_score: 5 });
            }
        }
    });

    const optimized_score = calculateScore();
    return { html: $('body').html() || $.html(), report: { initial_score, optimized_score, delta: optimized_score - initial_score, logs } };
};
