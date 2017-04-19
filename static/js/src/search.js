(function() {
    // https://gist.github.com/mathewbyrne/1280286#gistcomment-2005392
    var slugify = function(text) {
        var a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
        var b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
        var p = new RegExp(a.split('').join('|'), 'g');

        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/&/g, '-and-')         // Replace & with 'and'
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    var initializeLunrIndex = function(items) {
        var idx = lunr(function() {
            this.ref('title');
            this.field('title');
            this.field('notes');

            items.forEach(function(d) {
                this.add(d);
            }, this);
        });

        return idx;
    };

    var data = {};
    var index;
    $.getJSON('/json/all/').done(function(items) {
        index = initializeLunrIndex(items);
        items.forEach(function(d) {
            data[d.title] = d;
        });
    }).fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ', ' + error;
        console.error('Error getting Hugo index file:', err);
    });

    var doSearch = function() {
        var q = $('#q').val();
        var results = index.search('*' + q + '*');
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

    });
})();
