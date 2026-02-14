import * as cheerio from 'cheerio';
import { ParsedField } from './fieldGenerator';

/**
 * STEP 2: Deterministic PHP Generation
 */
export const generatePHP = (
    html: string,
    fields: ParsedField[],
    templateName: string = 'Generated Template',
    includeHeader: boolean = true
): string => {
    const $ = cheerio.load(html);
    const phpRegistry = new Map<string, string>();
    let placeholderCounter = 0;

    const reservePlaceholder = (phpCode: string): string => {
        const id = `WP_PHP_RAW_${placeholderCounter++}`;
        phpRegistry.set(id, phpCode);
        return id;
    };

    /**
     * Rebuild structural hierarchy child-by-child
     */
    const rebuildFromMapping = (fieldList: ParsedField[], $context: cheerio.Cheerio<any>, isInsideLoop: boolean = false) => {
        fieldList.forEach(field => {
            if (field.type === 'repeater') {
                const repTag = field.tag;
                const repClass = field.classes;

                // Build loop instance
                const $newInstance = $(`<${repTag}${repClass ? ` class="${repClass}"` : ''}></${repTag}>`);
                if (field.children) {
                    rebuildFromMapping(field.children, $newInstance, true);
                }

                const loopCode = `
<?php if (have_rows('${field.slug}')): ?>
    <?php while (have_rows('${field.slug}')): the_row(); ?>
        ${$.html($newInstance)}
    <?php endwhile; ?>
<?php endif; ?>`.trim();
                $context.append(`<ph id="${reservePlaceholder(loopCode)}"></ph>`);
            } else if (field.type === 'container') {
                const $container = $(`<${field.tag}${field.classes ? ` class="${field.classes}"` : ''}></${field.tag}>`);
                if (field.children) {
                    rebuildFromMapping(field.children, $container, isInsideLoop);
                }
                $context.append($container);
            } else {
                const getFunc = isInsideLoop ? 'get_sub_field' : 'get_field';
                const theFunc = isInsideLoop ? 'the_sub_field' : 'the_field';
                const varSub = isInsideLoop ? 'sub_' : '';

                let $target;
                if (field.type === 'text' || field.type === 'textarea') {
                    $target = $(`<${field.tag}${field.classes ? ` class="${field.classes}"` : ''}></${field.tag}>`);
                    $target.html(`<ph id="${reservePlaceholder(`<?php ${theFunc}('${field.slug}'); ?>`)}"></ph>`);
                    $context.append($target);
                } else if (field.type === 'image') {
                    const php = `
<?php $${varSub}${field.slug} = ${getFunc}('${field.slug}'); ?>
<?php if ($${varSub}${field.slug}): ?>
    <img src="<?php echo esc_url($${varSub}${field.slug}['url']); ?>" 
         alt="<?php echo esc_attr($${varSub}${field.slug}['alt']); ?>">
<?php endif; ?>`.trim();
                    $context.append(`<ph id="${reservePlaceholder(php)}"></ph>`);
                } else if (field.type === 'link') {
                    const php = `
<?php $${varSub}${field.slug} = ${getFunc}('${field.slug}'); ?>
<?php if ($${varSub}${field.slug}): ?>
    <a href="<?php echo esc_url($${varSub}${field.slug}['url']); ?>"${field.classes ? ` class="${field.classes}"` : ''}>
        <?php echo esc_html($${varSub}${field.slug}['title']); ?>
    </a>
<?php endif; ?>`.trim();
                    $context.append(`<ph id="${reservePlaceholder(php)}"></ph>`);
                }
            }
        });
    };

    const $body = $('body').length > 0 ? $('body').empty() : $.root().empty();
    rebuildFromMapping(fields, $body);

    let finalOutput = $body.html() || $.html();

    // Multi-pass placeholder expansion
    let safeguard = 0;
    while (finalOutput.includes('<ph id="WP_PHP_RAW_') && safeguard < 20) {
        phpRegistry.forEach((code, id) => {
            const tag = `<ph id="${id}"></ph>`;
            if (finalOutput.includes(tag)) {
                finalOutput = finalOutput.split(tag).join(code);
            }
        });
        safeguard++;
    }

    if (includeHeader) {
        return `<?php\n/*\nTemplate Name: ${templateName}\n*/\n?>\n\n` + finalOutput;
    }

    return finalOutput;
};
