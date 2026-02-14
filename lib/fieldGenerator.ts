import { CheerioAPI } from 'cheerio';
type Element = any; // Safe fallback for build stability across Cheerio versions
import { v4 as uuidv4 } from 'uuid';

export interface ParsedField {
    id: string;
    type: 'text' | 'textarea' | 'image' | 'link' | 'repeater' | 'container' | 'form_field';
    tag: string;
    classes: string;
    originalContent: string;
    slug: string;
    children?: ParsedField[];
    componentType?: 'hero' | 'card_collection' | 'pricing' | 'testimonial' | 'form';
    fieldType?: 'string' | 'text' | 'email' | 'url' | 'boolean' | 'enum' | 'image' | 'number';
}

const toSnakeCase = (str: string): string => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .toLowerCase()
        .replace(/^_+|_+$/g, '');
};

const cleanClassName = (cls: string): string => {
    if (!cls) return '';
    const mainClass = cls.split(/\s+/)[0];
    return toSnakeCase(mainClass)
        .replace(/^(section|block|wrapper|container|group)_/g, '')
        .replace(/^_+|_+$/g, '');
};

const singularize = (str: string): string => {
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
    if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
    return str;
};

const getSignature = (element: Element, $: CheerioAPI): string => {
    const tag = element.tagName.toLowerCase();
    const cls = ($(element).attr('class') || '').split(/\s+/)[0];
    const structure = $(element).children()
        .map((_, el) => el.tagName.toLowerCase())
        .get()
        .join('-');
    return `${tag}${cls ? `.${cls}` : ''}[${structure}]`;
};

/**
 * STEP 1: Component Intelligence & Structural Analysis
 */
export const generateFields = ($: CheerioAPI): ParsedField[] => {
    const fields: ParsedField[] = [];
    const processedElements = new Set<Element>();
    const contextTagCounts: Map<string, Record<string, number>> = new Map();
    let h1Count = 0;

    const getSemanticSlug = (element: Element, isInsideList: boolean, parentContext: string): string => {
        const $el = $(element);
        const tag = element.tagName.toLowerCase();
        const classes = ($el.attr('class') || '').toLowerCase();

        let subType = '';
        if (classes.includes('title') || classes.includes('heading')) subType = 'title';
        else if (classes.includes('price') || classes.includes('cost')) subType = 'price';
        else if (classes.includes('desc') || classes.includes('text') || classes.includes('content')) subType = 'description';
        else if (classes.includes('btn') || classes.includes('cta') || classes.includes('link') || tag === 'button') subType = 'link';
        else if (tag.startsWith('h')) subType = 'title';
        else if (tag === 'p') subType = 'description';
        else if (tag === 'li') subType = 'item';
        else if (tag === 'img') subType = 'image';
        else if (tag === 'a' || tag === 'button') subType = 'link';
        else subType = 'content';

        const context = parentContext ? singularize(parentContext) : '';

        if (isInsideList) {
            if (tag === 'a' || tag === 'button') return context ? context + '_link' : 'item_link';
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img'].includes(tag)) {
                return context ? `${context}_${subType}` : subType;
            }
            return context || 'item';
        }

        if (context) {
            if (subType === 'item') return context;
            if (subType === 'link' && (tag === 'a' || tag === 'button')) return context + '_link';
            if (subType === 'title' && tag.startsWith('h')) return context + '_title';
            if (subType === 'description' && tag === 'p') return context + '_description';
            if (subType.startsWith(context + '_')) return subType;
            return context + '_' + subType;
        }

        return subType;
    };

    const markProcessedRecursive = (el: Element) => {
        processedElements.add(el);
        $(el).children().each((_, child) => markProcessedRecursive(child as any));
    };

    const detectComponentTypeFor = (el: Element, $: CheerioAPI): ParsedField['componentType'] => {
        const tag = el.tagName.toLowerCase();
        const cls = ($(el).attr('class') || '').toLowerCase();
        const $el = $(el);

        if (tag === 'section' || tag === 'div' || tag === 'header') {
            if ($el.find('h1').length > 0 && (cls.includes('hero') || cls.includes('banner') || cls.includes('intro'))) return 'hero';
        }
        if (cls.includes('plan') || cls.includes('pricing')) return 'pricing';
        if (cls.includes('testimonial')) return 'testimonial';
        if (tag === 'form') return 'form';

        return undefined;
    };

    const scanNode = (container: Element, depth: number = 0, contextId = 'root', isInsideList = false, parentContext = ''): ParsedField[] => {
        if (depth >= 20) return [];
        const results: ParsedField[] = [];
        const $container = $(container);
        const children = $container.children().toArray();

        const containerTag = container.tagName?.toLowerCase();
        const containerClass = ($(container).attr('class') || '').toLowerCase();
        const currentContext = cleanClassName(containerClass) || parentContext;

        if (containerTag === 'form') {
            $container.find('input, textarea, select').each((_, el) => {
                const $f = $(el);
                const tag = el.tagName.toLowerCase();
                const type = $f.attr('type') || 'text';
                const name = $f.attr('name') || $f.attr('id') || `field_${uuidv4().slice(0, 4)}`;
                let fieldType: ParsedField['fieldType'] = 'string';
                if (type === 'email') fieldType = 'email';
                else if (tag === 'textarea') fieldType = 'text';
                else if (type === 'checkbox') fieldType = 'boolean';
                else if (tag === 'select') fieldType = 'enum';
                else if (type === 'number') fieldType = 'number';
                results.push({ id: uuidv4(), type: 'form_field', tag, classes: $f.attr('class') || '', originalContent: '', slug: toSnakeCase(name), fieldType });
                processedElements.add(el as any);
            });
        }

        // --- EXPLICIT LIST DETECTION ---
        if ((containerTag === 'ul' || containerTag === 'ol')) {
            const items = $container.children('li').toArray();
            if (items.length > 0) {
                const repeaterSlug = cleanClassName($(container).attr('class') || '') || 'items';
                const firstItem = items[0];
                items.forEach(it => processedElements.add(it));
                const itemChildren = scanNode(firstItem, depth + 1, repeaterSlug, true, repeaterSlug);

                if (itemChildren.length === 0) {
                    const hasLink = $(firstItem).find('a, button').length > 0;
                    const context = singularize(repeaterSlug);
                    if (hasLink) {
                        const linkEl = $(firstItem).find('a, button').first().get(0)!;
                        itemChildren.push({ id: uuidv4(), type: 'link', tag: linkEl.tagName.toLowerCase(), classes: $(linkEl).attr('class') || '', originalContent: $(linkEl).text().trim(), slug: context ? context + '_link' : 'item_link' });
                    } else {
                        itemChildren.push({ id: uuidv4(), type: 'text', tag: 'li', classes: $(firstItem).attr('class') || '', originalContent: $(firstItem).text().trim(), slug: context || 'item' });
                    }
                }
                items.forEach(it => markProcessedRecursive(it));
                results.push({ id: uuidv4(), type: 'repeater', tag: 'li', classes: $(firstItem).attr('class') || '', originalContent: '', slug: repeaterSlug, children: itemChildren });
                return results;
            }
        }

        // --- GROUP DETECTION ---
        const signatures: Map<string, Element[]> = new Map();
        children.forEach(child => {
            if (processedElements.has(child)) return;
            const sig = getSignature(child, $);
            if (!signatures.has(sig)) signatures.set(sig, []);
            signatures.get(sig)!.push(child);
        });

        signatures.forEach((items) => {
            if (items.length < 2) return;
            const firstItem = items[0];
            const itemTag = firstItem.tagName.toLowerCase();
            const rawClass = $(firstItem).attr('class') || '';
            const repeaterSlug = cleanClassName(rawClass || (containerTag === 'ul' ? containerClass : '')) || (containerTag === 'ul' ? 'items' : 'items');

            items.forEach(it => processedElements.add(it));
            const itemChildren = scanNode(firstItem, depth + 1, repeaterSlug, false, repeaterSlug);

            if (itemChildren.length === 0) {
                const context = singularize(repeaterSlug);
                itemChildren.push({ id: uuidv4(), type: 'text', tag: itemTag, classes: rawClass, originalContent: $(firstItem).text().trim(), slug: context || 'item' });
            }
            items.forEach(it => markProcessedRecursive(it));
            results.push({ id: uuidv4(), type: 'repeater', tag: itemTag, classes: rawClass, originalContent: '', slug: repeaterSlug, children: itemChildren });
        });

        // --- STATIC / CONTAINERS ---
        children.forEach(child => {
            if (processedElements.has(child)) return;
            const $el = $(child);
            const tag = child.tagName.toLowerCase();
            const supported = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'a', 'li', 'button'];

            if (tag === 'h1') h1Count++;

            if (supported.includes(tag)) {
                let type: ParsedField['type'] = 'text';
                let content = '';
                if (tag.startsWith('h')) { type = 'text'; content = $el.text().trim(); }
                else if (tag === 'p') { type = 'textarea'; content = $el.text().trim(); }
                else if (tag === 'img') { type = 'image'; content = $el.attr('alt') || $el.attr('src') || ''; }
                else if (tag === 'a' || tag === 'button') { type = 'link'; content = $el.attr('href') || $el.text().trim(); }
                else if (tag === 'li') {
                    if ($el.find('a, button').length > 0) {
                        results.push(...scanNode(child, depth + 1, contextId, true, currentContext));
                        return;
                    }
                    type = 'text'; content = $el.text().trim();
                }

                if (content || type === 'image' || type === 'link') {
                    processedElements.add(child);
                    const slug = getSemanticSlug(child, isInsideList, currentContext);
                    results.push({ id: uuidv4(), type, tag, classes: $el.attr('class') || '', originalContent: content, slug });
                }
            } else {
                const subCtx = cleanClassName($el.attr('class') || '') || currentContext;
                const subResults = scanNode(child, depth + 1, contextId, isInsideList, subCtx);
                if (subResults.length > 0) {
                    processedElements.add(child);
                    results.push({
                        id: uuidv4(), type: 'container', tag, classes: $el.attr('class') || '', originalContent: '',
                        slug: cleanClassName($el.attr('class') || '') || `container_${tag}`,
                        children: subResults,
                        componentType: detectComponentTypeFor(child, $)
                    });
                }
            }
        });

        return results;
    };

    const root = $.root().find('body').get(0) || $.root().get(0);
    fields.push(...scanNode(root as any));
    return fields;
};
