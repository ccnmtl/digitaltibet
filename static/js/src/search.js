/* eslint-env jquery */
/* globals lunr, AWS_URL */

(function() {
    // https://gist.github.com/mathewbyrne/1280286#gistcomment-2005392
    var slugify = function(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/&/g, '-and-')         // Replace & with 'and'
            .replace(/[^\w-]+/g, '')       // Remove all non-word chars
            .replace(/--+/g, '-')         // Replace multiple - with single -
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

        initializeOptions(
            categories.dates, $('select.dt-date'));
        initializeOptions(
            categories.culturalRegions, $('select.dt-cultural-region'));
        initializeOptions(
            categories.sources, $('select.dt-source'));
        initializeOptions(
            categories.objectUses, $('select.dt-object-use'));
    });

    var doSearch = function() {
        var q = $.trim($('#q').val());

        var searchParams = [];

        if ($('select.dt-date').val()) {
            searchParams.push([
                'date_range',  $('select.dt-date').val()
            ]);
        }
        if ($('select.dt-cultural-region').val()) {
            searchParams.push([
                'cultural_region', $('select.dt-cultural-region').val()
            ]);
        }
        if ($('select.dt-source').val()) {
            searchParams.push([
                'source_title', $('select.dt-source').val()
            ]);
        }
        if ($('select.dt-object-use').val()) {
            searchParams.push([
                'object_use', $('select.dt-object-use').val()
            ]);
        }

        var mainTerm = '';
        if (q) {
            mainTerm = '*' + q + '*';
        }

        if (!q && searchParams.length === 0) {
            // No search params? Then just show everything.
            $('#all-objects').show();
            return false;
        }

        results = index.query(function(q) {
            searchParams.forEach(function(param) {
                var k = param[0];
                var v = param[1];
                if (v) {
                    q.term(v.toLowerCase(), {fields: [k]});
                }
            });
            if (mainTerm) {
                q.term(mainTerm.toLowerCase());
                searchParams.push(mainTerm.toLowerCase());
            }
        }).filter(function(result) {
            return Object.keys(result.matchData.metadata).length ===
                searchParams.length;
        });

        var $el = $('#search-results');
        $el.show();
        $('#all-objects').hide();

        results.forEach(function(r) {
            var d = data[r.ref];
            var href = '/object/' + slugify(d.title) + '/';
            var imgSrc = AWS_URL + 'objects/' + d.thumbnail;

            var $card = $(
                '<div class="card">' +
                    '<a href="' + href + '">' +
                    '<img src="' + imgSrc + '" ' +
                    'class="card-img-top img-fluid" ' +
                    'alt="Image of ' + d.title + '">' +
                    '</a>' +

                '<div class="card-block">' +
                    '<h4 class="card-title">' +
                    '<a href="' + href + '">' + d.title + '</a>' +
                    '</h4>' +
                    '</div>' +
                    '</div>'
            );
            $el.append($card);
        });
        return false;
    };

    var clearSearch = function() {
        $('#search-results').empty();
    };

    $(document).ready(function() {
        $('#search').click(doSearch);
        $('#clear-search').click(clearSearch);
        $('#q').keyup(function() {
            clearSearch();
            return doSearch();
        });

        $('select.dt-date,select.dt-cultural-region,' +
          'select.dt-source,select.dt-object-use'
        ).change(function() {
            clearSearch();
            return doSearch();
        });
    });
})();
