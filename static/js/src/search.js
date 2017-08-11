/* eslint-env jquery */
/* eslint-env node */

if (typeof AWS_URL === 'undefined') {
    var AWS_URL = '';
}

if (typeof require === 'function') {
    var jsdom = require('jsdom');
    var JSDOM = jsdom.JSDOM;
    var window = new JSDOM('<!DOCTYPE html>').window;
    var $ = require('jquery')(window);
    var lunr = require('lunr');
}

(function() {
    var Search = function(items) {
        // This is the category filter data to be
        // populated with the JSON.
        var categories = {
            dates: [],
            culturalRegions: [],
            sources: [],
            objectUses: []
        };

        this.results = [];
        this.data = {};
        this.index = initializeLunrIndex(items);

        var me = this;
        items.forEach(function(d) {
            me.data[d.title] = d;

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
    };

    /**
     * params: an array of search term strings:
     *
     * [
     *   free-form search term,
     *   date,
     *   cultural region,
     *   source,
     *   object use
     * ]
     */
    Search.prototype.doSearch = function(params) {
        var mainTerm = params[0].split(' ').map(function(x) {
            if (x) {
                return '*' + x + '*';
            } else {
                return x;
            }
        });

        var searchParams = [];

        if (params[1]) {
            searchParams.push(['date_range',  params[1]]);
        }
        if (params[2]) {
            searchParams.push(['cultural_region', params[2]]);
        }
        if (params[3]) {
            searchParams.push(['source_title', params[3]]);
        }
        if (params[4]) {
            searchParams.push(['object_use', params[4]]);
        }

        if ((mainTerm.length === 0 || !mainTerm[0]) && searchParams.length === 0) {
            // No search params? Then just show everything.
            $('#all-objects').show();
            return false;
        }

        this.results = this.index.query(function(q) {
            searchParams.forEach(function(param) {
                var k = param[0];
                var v = param[1];
                if (v) {
                    q.term(v.toLowerCase(), {fields: [k]});
                }
            });
            mainTerm.forEach(function(param) {
                if (param) {
                    q.term(param.toLowerCase());
                    searchParams.push(param.toLowerCase());
                }
            });
        }).filter(function(result) {
            return Object.keys(result.matchData.metadata).length ===
                searchParams.length;
        });

        var $el = $('#search-results');
        $el.show();
        $('#all-objects').hide();

        var me = this;
        this.results.forEach(function(r) {
            var d = me.data[r.ref];
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
            this.field('material');            
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

    var clearSearch = function() {
        $('#search-results').empty();
    };

    if (typeof document === 'object') {
        $(document).ready(function() {
            $.getJSON('/json/all/').done(function(items) {
                var search = new Search(items);

                $('#clear-search').click(clearSearch);
                $('#q').keyup(function() {
                    clearSearch();
                    return search.doSearch([
                        $.trim($('#q').val()),
                        $('select.dt-date').val(),
                        $('select.dt-cultural-region').val(),
                        $('select.dt-source').val(),
                        $('select.dt-object-use').val()
                    ]);
                });

                $('select.dt-date,select.dt-cultural-region,' +
                  'select.dt-source,select.dt-object-use'
                ).change(function() {
                    clearSearch();
                    return search.doSearch([
                        $.trim($('#q').val()),
                        $('select.dt-date').val(),
                        $('select.dt-cultural-region').val(),
                        $('select.dt-source').val(),
                        $('select.dt-object-use').val()
                    ]);
                });
            });
        });
    }

    if (typeof module !== 'undefined') {
        module.exports = { Search: Search };
    }
})();
