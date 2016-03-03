$(document).ready(function() {
    // Connect the panzoomer up to the user controls
    var $section = $('.collection-image').first();
    var $pz = $('.panzoomer').first();
    $section.find('img').panzoom({
        $zoomIn: $pz.find('.zoom-in'),
        $zoomOut: $pz.find('.zoom-out'),
        $zoomRange: $pz.find('.zoom-range'),
        $reset: $pz.find('.reset')
    });
});
