/* eslint-env jquery */

$(document).ready(function() {
    // Connect the panzoomer up to the user controls
    var $section = $('.collection-image').first();
    var $img = $section.find('img');
    var $pz = $('.panzoomer').first();

    var containerWidth = $section.width();
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
