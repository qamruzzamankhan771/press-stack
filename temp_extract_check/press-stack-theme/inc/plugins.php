<?php
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
        
        array(
            'name'      => 'Rank Math SEO',
            'slug'      => 'rank-math',
            'required'  => true,
        ),
        array(
            'name'      => 'Wordfence Security',
            'slug'      => 'wordfence',
            'required'  => true,
        ),
        array(
            'name'      => 'Advanced Custom Fields',
            'slug'      => 'advanced-custom-fields',
            'required'  => true,
        ),
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
