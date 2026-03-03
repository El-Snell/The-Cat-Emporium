lightGallery(document.getElementById('customize-thumbnails-gallery'), {
    // Add a custom class to apply style only for the particular gallery
    addClass: 'lg-custom-thumbnails',

    // Remove the starting animations.
    // This can be done by overriding CSS as well
    appendThumbnailsTo: '.lg-outer',

    animateThumb: false,
    allowMediaOverlap: true,
});