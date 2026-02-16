<?php get_header(); ?>
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <main>
        <section class="feature-block">
            <div class="wrap">
                <h1>
                    <?php the_field('wrap_title'); ?>
                </h1>
                <div class="grid">
                    <div class="item">
                        <?php $item_image = get_field('item_image'); ?>
                        <?php if ($item_image): ?>
                            <img src="
                            <?php echo esc_url($item_image['url']); ?>
                            "
                            alt="
                            <?php echo esc_attr($item_image['alt']); ?>
                            ">
                            <?php endif; ?>
                            <h2>
                                <?php the_field('item_title'); ?>
                            </h2>
                            <p>
                                <?php the_field('item_description'); ?>
                            </p>
                        </div>
                        <div class="item">
                            <?php $item_image = get_field('item_image'); ?>
                            <?php if ($item_image): ?>
                                <img src="
                                <?php echo esc_url($item_image['url']); ?>
                                "
                                alt="
                                <?php echo esc_attr($item_image['alt']); ?>
                                ">
                                <?php endif; ?>
                                <h3>
                                    <?php the_field('item_title'); ?>
                                </h3>
                                <p>
                                    <?php the_field('item_description'); ?>
                                </p>
                                <?php $item_link = get_field('item_link'); ?>
                                <?php if ($item_link): ?>
                                    <a href="
                                        <?php echo esc_url($item_link['url']); ?>
                                        ">
                                        <?php echo esc_html($item_link['title']); ?>
                                    </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <?php endwhile; endif; ?>
                <?php get_footer(); ?>