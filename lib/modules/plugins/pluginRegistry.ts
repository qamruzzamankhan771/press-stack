export interface PluginDefinition {
    id: string;
    name: string;
    description: string;
    category: 'Core' | 'SEO' | 'Performance' | 'Commerce' | 'Security';
    functions_logic?: string; // Snippets to add to functions.php
    required_plugins?: string[]; // IDs of other plugins to auto-select
}

export const SUPPORTED_PLUGINS: PluginDefinition[] = [
    {
        id: 'acf-pro',
        name: 'Advanced Custom Fields (ACF)',
        description: 'The foundation for professional custom WordPress development.',
        category: 'Core',
        functions_logic: "// ACF Logic: Auto-register fields\nadd_filter('acf/settings/save_json', function($path) { return get_stylesheet_directory() . '/inc/acf-json'; });"
    },
    {
        id: 'cf7',
        name: 'Contact Form 7',
        description: 'The standard for WordPress contact forms.',
        category: 'Core'
    },
    {
        id: 'wp-mail-smtp',
        name: 'WP Mail SMTP',
        description: 'Ensure your emails actually get delivered.',
        category: 'Core'
    },
    {
        id: 'rank-math',
        name: 'Rank Math SEO',
        description: 'Modern SEO suite for WordPress.',
        category: 'SEO',
        functions_logic: "// Rank Math: Breadcrumbs support\nadd_theme_support('rank-math-breadcrumbs');"
    },
    {
        id: 'wp-rocket',
        name: 'WP Rocket',
        description: 'The most powerful web performance tool.',
        category: 'Performance'
    },
    {
        id: 'wordfence',
        name: 'Wordfence Security',
        description: 'Firewall and malware scan for WordPress.',
        category: 'Security'
    }
];
