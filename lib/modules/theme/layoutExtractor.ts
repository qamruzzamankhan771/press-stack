import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR } from '@/lib/config';

interface ExtractionResult {
    strippedHtml: string;
    headerContent: string | null;
    footerContent: string | null;
}

/**
 * Extracts <header> and <footer> landmarks from HTML source.
 */
export const extractLayout = (html: string, projectId: string): ExtractionResult => {
    const $ = cheerio.load(html);
    const themePath = path.join(PROJECTS_DIR, projectId, 'theme');

    let headerContent: string | null = null;
    let footerContent: string | null = null;

    // 1. Extract Header
    const $header = $('header').first();
    if ($header.length > 0) {
        headerContent = $.html($header);
        $header.remove();

        // Save to theme/header.php if not already established
        const headerFilePath = path.join(themePath, 'header.php');
        if (shouldWriteLayout(headerFilePath)) {
            fs.writeFileSync(headerFilePath, `<!DOCTYPE html>\n<html <?php language_attributes(); ?>>\n<head>\n    <meta charset="<?php bloginfo( 'charset' ); ?>">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <?php wp_head(); ?>\n</head>\n<body <?php body_class(); ?>>\n<?php wp_body_open(); ?>\n${headerContent}`);
        }
    }

    // 2. Extract Footer
    const $footer = $('footer').last();
    if ($footer.length > 0) {
        footerContent = $.html($footer);
        $footer.remove();

        // Save to theme/footer.php if not already established
        const footerFilePath = path.join(themePath, 'footer.php');
        if (shouldWriteLayout(footerFilePath)) {
            fs.writeFileSync(footerFilePath, `${footerContent}\n<?php wp_footer(); ?>\n</body>\n</html>`);
        }
    }

    return {
        strippedHtml: $.html('body') || $.html(),
        headerContent,
        footerContent
    };
};

/**
 * Checks if we should overwrite the layout file.
 * Returns true if file is missing or contains the default placeholder.
 */
function shouldWriteLayout(filePath: string): boolean {
    if (!fs.existsSync(filePath)) return true;
    const content = fs.readFileSync(filePath, 'utf8');
    return (
        content.includes('<!-- WP_SHELL_PLACEHOLDER -->') ||
        content.includes('// Theme Header') ||
        content.includes('// Theme Footer') ||
        content.trim() === ''
    );
}
