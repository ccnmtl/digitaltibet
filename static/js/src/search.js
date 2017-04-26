/* eslint-env jquery */
/* globals lunr */

(function() {
    // https://gist.github.com/mathewbyrne/1280286#gistcomment-2005392
    var slugify = function(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/&/g, '-and-')         // Replace & with 'and'
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    var appendWithoutDuplicates = function(array, item) {
        if (array.indexOf(item) < 0) {
            array.push(item);
        }
    };

    var initializeLunrIndex = function(items) {
        var idx = lunr(function() {
            this.ref('title');
            this.field('title');
            this.field('notes');
            this.field('date_range');
            this.field('cultural_region');
            this.field('source_title');
            this.field('object_use');

            items.forEach(function(d) {
                this.add(d);
            }, this);
        });

        return idx;
    };

    var initializeOptions = function(options, $selectEl) {
        options.forEach(function(e) {
            $selectEl.append(
                '<option value="' + e + '">' +
                    e + '</option>');
        });
    };

    // This is the category filter data to be
    // populated with the JSON.
    var categories = {
        dates: [],
        culturalRegions: [],
        sources: [],
        objectUses: []
    };

    var results = [];

    var data = {};
    var index;
    $.getJSON('/json/all/').done(function(items) {
        index = initializeLunrIndex(items);
        items.forEach(function(d) {
            data[d.title] = d;

            if (d.date_range) {
                appendWithoutDuplicates(
                    categories.dates,
                    $.trim(d.date_range));
            }
            if (d.cultural_region) {
                appendWithoutDuplicates(
                    categories.culturalRegions,
                    $.trim(d.cultural_region));
            }
            if (d.source_title) {
                appendWithoutDuplicates(
                    categories.sources,
                    $.trim(d.source_title));
            }
            if (d.object_use) {
                appendWithoutDuplicates(
                    categories.objectUses,
                    $.trim(d.object_use));
            }
        });

        categories.dates.sort();
        categories.culturalRegions.sort();
        categories.sources.sort();
        categories.objectUses.sort();

        initializeOptions(categories.dates,
                          $('select.dt-date'));
        initializeOptions(categories.culturalRegions,
                          $('select.dt-cultural-region'));
        initializeOptions(categories.sources,
                          $('select.dt-source'));
        initializeOptions(categories.objectUses,
                          $('select.dt-object-use'));
    });

    var doSearch = function() {
        var q = $('#q').val();

        var searchParams = [];

        if ($('select.dt-date').val()) {
            searchParams.push(
                'date_range:' + $('select.dt-date').val());
        }
        if ($('select.dt-cultural-region').val()) {
            searchParams.push(
                'cultural_region:' + $('select.dt-cultural-region').val());
        }
        if ($('select.dt-source').val()) {
            searchParams.push(
                'source_title:' + $('select.dt-source').val());
        }
        if ($('select.dt-object-use').val()) {
            searchParams.push(
                'object_use:' + $('select.dt-object-use').val());
        }

        var mainTerm = '*' + q + '*';
        searchParams.push(mainTerm);
        results = index.search(searchParams.join(' '));

        var $el = $('#search-results');
        $el.find('ul').empty();
        $el.show();
        if (results.length === 0) {
            $el.find('ul').append('<div>No results.</div>');
        } else {
            $el.prepend('<h4>Search results:</h4>');
            results.slice(0, 10).forEach(function(r) {
                var d = data[r.ref];
                var $li = $('<li></li>');
                var $a = $('<a>', {
                    href: '/object/' + slugify(d.title) + '/',
                    html: d.title
                });

                $li.append($a);
                $el.find('ul').append($li);
            });
        }
        return false;
    };

    var clearSearch = function() {
        $('#search-results>ul').empty();
        $('#search-results>h4').remove();
        $('#search-results').hide();
    };

    $(document).ready(function() {
        $('#search').click(doSearch);
        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            $('#search-results>ul').empty();
            $('#search-results>h4').remove();
            if ($(this).val().length > 2) {
                return doSearch();
            }
        });

        $('select.dt-date').change(function() {
            $('#search-results>ul').empty();
            $('#search-results>h4').remove();
            return doSearch();
        });
        $('select.dt-cultural-region').change(function() {
            $('#search-results>ul').empty();
            $('#search-results>h4').remove();
            return doSearch();
        });
        $('select.dt-source').change(function() {
            $('#search-results>ul').empty();
            $('#search-results>h4').remove();
            return doSearch();
        });
        $('select.dt-object-use').change(function() {
            $('#search-results>ul').empty();
            $('#search-results>h4').remove();
            return doSearch();
        });
    });
})();
