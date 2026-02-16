<?php
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
