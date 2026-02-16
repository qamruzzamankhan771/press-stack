import path from 'path';

export const PROJECTS_DIR = path.join(process.cwd(), 'projects');

export const WP_THEME_FOLDERS = [
    'theme/templates',
    'theme/template-parts',
    'theme/assets',
    'theme/inc',
    'theme/inc/acf-json'
];

export const WP_CORE_FILES = [
    { path: 'theme/style.css', content: '/*\nTheme Name: Lumina Generated Theme\nAuthor: Press Stack\n*/' },
    { path: 'theme/index.php', content: '<?php // Silence is golden' },
    { path: 'theme/functions.php', content: '<?php\n// Theme Functions' },
    { path: 'theme/header.php', content: '<?php\n// Theme Header' },
    { path: 'theme/footer.php', content: '<?php\n// Theme Footer' }
];
