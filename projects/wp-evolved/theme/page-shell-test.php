<?php
/*
Template Name: Shell Test
*/
?>
<?php get_header(); ?>
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
<main>
    <p>
        <?php the_field('description'); ?>
    </p>
</main>
<?php endwhile; endif; ?>
<?php get_footer(); ?>