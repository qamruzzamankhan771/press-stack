<?php
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
