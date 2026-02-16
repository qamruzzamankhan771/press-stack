<?php
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
