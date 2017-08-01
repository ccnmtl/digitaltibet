/* eslint-env jquery */
/* globals loadImage */

$(document).ready(function() {
    if ($('.collection-image').length < 1) {
        return;
    }

    // Connect the panzoomer up to the user controls
    var $section = $('.collection-image').first();
    var $img = $section.find('img');
    var $pz = $('.panzoomer').first();

    var containerWidth = $section.width();
    loadImage($img[0].src).then(function() {
        var imgWidth = $img.width();
        var diff = (containerWidth - imgWidth) / 2;

        $img.panzoom({
            $zoomIn: $pz.find('.zoom-in'),
            $zoomOut: $pz.find('.zoom-out'),
            $zoomRange: $pz.find('.zoom-range'),
            $reset: $pz.find('.reset'),

            // Center the image within the panzoom container
            startTransform: 'translateX(' + diff + 'px)'
        });
    });
});
