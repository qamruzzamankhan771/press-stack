import { SUPPORTED_PLUGINS } from './plugins/pluginRegistry';

/**
 * Generates PHP code for `inc/plugins.php` that configures TGM Plugin Activation.
 * This instructs WordPress to require/recommend the selected plugins.
 */
export const generatePluginActivation = (pluginIds: string[]): string => {
    // 1. Resolve Plugin Details
    const plugins = pluginIds.map(id => {
        const def = SUPPORTED_PLUGINS.find(p => p.id === id);
        return def ? {
            name: def.name,
            slug: def.id,
            required: true,
            force_activation: false
        } : null;
    }).filter(Boolean);

    // Always require ACF if not present
    if (!plugins.find(p => p?.slug === 'advanced-custom-fields-pro' || p?.slug === 'advanced-custom-fields')) {
        plugins.push({
            name: 'Advanced Custom Fields',
            slug: 'advanced-custom-fields',
            required: true,
            force_activation: false
        });
    }

    if (plugins.length === 0) return '<?php // No plugins required. ?>';

    // 2. Build PHP Logic
    // We construct the PHP array string manually for better formatting than JSON
    const pluginArrayStr = plugins.map(p => `
        array(
            'name'      => '${p?.name}',
            'slug'      => '${p?.slug}',
            'required'  => ${p?.required},
        ),`).join('');

    return `<?php
/**
 * TGM Plugin Activation Configuration
 *
 * Checks for required plugins and displays an admin notice/installer via TGMPA.
 */

require_once get_template_directory() . '/inc/class-tgm-plugin-activation.php';

add_action( 'tgmpa_register', 'press_stack_register_required_plugins' );

function press_stack_register_required_plugins() {
    /*
     * Array of plugin arrays. Required keys are name and slug.
     * If the source is NOT from the .org repo, then source is also required.
     */
    $plugins = array(
        ${pluginArrayStr}
    );

    /*
     * Array of configuration settings. Amend each line as needed.
     *
     * TGMPA comes with over 20 built-in settings. We are using the defaults.
     */
    $config = array(
        'id'           => 'press-stack',           // Unique ID for hashing notices for multiple instances of TGMPA.
        'default_path' => '',                      // Default absolute path to bundled plugins.
        'menu'         => 'tgmpa-install-plugins', // Menu slug.
        'parent_slug'  => 'themes.php',            // Parent menu slug.
        'capability'   => 'edit_theme_options',    // Capability needed to view plugin install page, should be a capability associated with the parent menu used.
        'has_notices'  => true,                    // Show admin notices or not.
        'dismissable'  => true,                    // If false, a user cannot dismiss the nag message.
        'dismiss_msg'  => '',                      // If 'dismissable' is false, this message will be output at top of nag.
        'is_automatic' => false,                   // Automatically activate plugins after installation or not.
        'message'      => '',                      // Message to output right before the plugins table.
    );

    tgmpa( $plugins, $config );
}
`;
};
