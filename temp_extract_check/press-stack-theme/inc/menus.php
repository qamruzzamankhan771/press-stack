<?php
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
