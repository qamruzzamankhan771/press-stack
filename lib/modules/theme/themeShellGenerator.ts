import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR } from '@/lib/config';

/**
 * Phase 3B: Theme Shell Generator
 * 
 * Generates modular WordPress theme shell files with idempotent guards.
 * Only generates files if they don't exist or contain default placeholders.
 */

interface ThemeShellFiles {
    'functions.php': string;
    'inc/setup.php': string;
    'inc/enqueue.php': string;
    'inc/menus.php': string;
    'inc/supports.php': string;
}

/**
 * Checks if a file should be written (doesn't exist or contains placeholder)
 */
function shouldWriteFile(filePath: string): boolean {
    if (!fs.existsSync(filePath)) return true;

    const content = fs.readFileSync(filePath, 'utf8');
    const placeholders = [
        '// Theme Functions',
        '// Theme Setup',
        '// Theme Enqueue',
        '// Theme Menus',
        '// Theme Supports',
        '<!-- THEME_SHELL_PLACEHOLDER -->'
    ];

    return placeholders.some(placeholder => content.includes(placeholder)) || content.trim() === '';
}

/**
 * Generates theme shell file contents
 */
function generateThemeShellFiles(): ThemeShellFiles {
    return {
        'functions.php': `<?php
/**
 * Theme Functions
 * 
 * This file only contains require_once statements.
 * All logic is modularized in the inc/ directory.
 */

// Theme Setup
require_once get_template_directory() . '/inc/setup.php';

// Asset Enqueue
require_once get_template_directory() . '/inc/enqueue.php';

// Navigation Menus
require_once get_template_directory() . '/inc/menus.php';

// Theme Supports
require_once get_template_directory() . '/inc/supports.php';
`,

        'inc/setup.php': `<?php
/**
 * Theme Setup
 * 
 * Registers theme features and configurations.
 */

if (!function_exists('press_stack_setup')) {
    function press_stack_setup() {
        // Add default posts and comments RSS feed links to head
        add_theme_support('automatic-feed-links');

        // Let WordPress manage the document title
        add_theme_support('title-tag');

        // Enable support for Post Thumbnails
        add_theme_support('post-thumbnails');

        // Switch default core markup to output valid HTML5
        add_theme_support('html5', array(
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        ));

        // Add theme support for selective refresh for widgets
        add_theme_support('customize-selective-refresh-widgets');
    }
}
add_action('after_setup_theme', 'press_stack_setup');
`,

        'inc/enqueue.php': `<?php
/**
 * Enqueue Scripts and Styles
 * 
 * Registers and enqueues theme assets.
 */

if (!function_exists('press_stack_enqueue_assets')) {
    function press_stack_enqueue_assets() {
        // Enqueue theme stylesheet
        wp_enqueue_style(
            'press-stack-style',
            get_stylesheet_uri(),
            array(),
            wp_get_theme()->get('Version')
        );

        // Enqueue theme scripts (if needed)
        // wp_enqueue_script(
        //     'press-stack-script',
        //     get_template_directory_uri() . '/assets/js/main.js',
        //     array(),
        //     wp_get_theme()->get('Version'),
        //     true
        // );
    }
}
add_action('wp_enqueue_scripts', 'press_stack_enqueue_assets');
`,

        'inc/menus.php': `<?php
/**
 * Navigation Menus
 * 
 * Registers theme navigation menus.
 */

if (!function_exists('press_stack_register_menus')) {
    function press_stack_register_menus() {
        register_nav_menus(array(
            'primary' => esc_html__('Primary Menu', 'press-stack'),
            'footer'  => esc_html__('Footer Menu', 'press-stack'),
        ));
    }
}
add_action('after_setup_theme', 'press_stack_register_menus');
`,

        'inc/supports.php': `<?php
/**
 * Theme Supports
 * 
 * Declares additional theme support features.
 */

if (!function_exists('press_stack_theme_supports')) {
    function press_stack_theme_supports() {
        // Add support for Block Styles
        add_theme_support('wp-block-styles');

        // Add support for full and wide align images
        add_theme_support('align-wide');

        // Add support for editor styles
        add_theme_support('editor-styles');

        // Add support for responsive embeds
        add_theme_support('responsive-embeds');
    }
}
add_action('after_setup_theme', 'press_stack_theme_supports');
`
    };
}

/**
 * Ensures WordPress theme shell files exist for a project.
 * Only writes files if they don't exist or contain default placeholders.
 * 
 * @param projectId - The project identifier
 */
export function ensureThemeShell(projectId: string): void {
    const themePath = path.join(PROJECTS_DIR, projectId, 'theme');
    const incPath = path.join(themePath, 'inc');

    // Ensure inc directory exists
    if (!fs.existsSync(incPath)) {
        fs.mkdirSync(incPath, { recursive: true });
    }

    // Generate file contents
    const files = generateThemeShellFiles();

    // Write files with idempotency guards
    Object.entries(files).forEach(([relativePath, content]) => {
        const absolutePath = path.join(themePath, relativePath);

        if (shouldWriteFile(absolutePath)) {
            // Ensure parent directory exists
            const dir = path.dirname(absolutePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(absolutePath, content, 'utf8');
        }
    });
}
