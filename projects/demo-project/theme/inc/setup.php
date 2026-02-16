<?php
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
