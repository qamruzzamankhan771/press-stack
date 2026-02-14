/**
 * Lightweight Code Formatters for HTML and PHP
 */

export const formatHTML = (html: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    // Simple regex to split tags
    const nodes = html.replace(/>\s+</g, '><').replace(/</g, '\n<').replace(/>/g, '>\n').split('\n');

    nodes.forEach(node => {
        if (!node.trim()) return;

        if (node.match(/^<\/\w/)) indent--;

        formatted += tab.repeat(Math.max(0, indent)) + node.trim() + '\n';

        if (node.match(/^<\w[^>]*[^\/]>$/) && !node.match(/^<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/)) {
            indent++;
        }
    });

    return formatted.trim();
};

export const formatPHP = (php: string): string => {
    let formatted = '';
    let indent = 0;
    const tab = '    ';

    // Normalize spacing and split into semantic lines (tags and PHP blocks)
    const normalized = php
        .replace(/>\s+</g, '><')
        .replace(/<\?php/g, '\n<?php')
        .replace(/\?>/g, '?>\n')
        .replace(/</g, '\n<')
        .replace(/>/g, '>\n')
        .replace(/\n\s*\n/g, '\n');

    const lines = normalized.split('\n');

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Decrease indent for closing statements
        if (
            trimmed.match(/^<\/\w/) ||
            trimmed.match(/^(endif|endwhile|endfor|else|elseif|}|(\?>))/)
        ) {
            indent--;
        }

        formatted += tab.repeat(Math.max(0, indent)) + trimmed + '\n';

        // Increase indent for opening statements
        const isSelfClosing = trimmed.match(/^<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)/);
        const isClosingTag = trimmed.match(/^<\//);

        if (
            (trimmed.match(/^<\w/) && !isSelfClosing && !isClosingTag && !trimmed.includes('</')) ||
            trimmed.match(/(if|while|for|foreach|else|elseif).*?:(\s*\?>)?$/) ||
            trimmed.match(/\{$/) ||
            trimmed.match(/<\?php\s+(if|while|for|foreach)/)
        ) {
            indent++;
        }
    });

    return formatted.trim();
};
