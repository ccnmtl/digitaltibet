/* eslint-env node */
/* eslint-env mocha */

var assert = require('assert');
var fs = require('fs');

var Search = require('../src/search.js').Search;

var items = JSON.parse(fs.readFileSync('static/js/tests/all.json', 'utf8'));

describe('Search', function() {
    it('can be initialized with an empty array', function() {
        var s = new Search([]);
        assert.strictEqual(s.results.length, 0);
    });

    it('can be initialized with items', function() {
        var s = new Search(items);
        assert.strictEqual(s.results.length, 0);
    });
});

describe('Search.doSearch()', function() {
    it('returns the right elements when empty', function() {
        var s = new Search([]);
        s.doSearch(['abc', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);
    });

    it('returns the right elements when there are items', function() {
        var s = new Search(items);
        s.doSearch(['abc', null, null, null, null]);
        assert.strictEqual(s.results.length, 0);

        s.doSearch(['Zoe', null, null, null, null]);
        assert.strictEqual(s.results.length, 6);

        s.doSearch(['zoe', null, null, null, null]);
        assert.strictEqual(s.results.length, 6);

        s.doSearch(['tribal', null, null, null, null]);
        assert.strictEqual(s.results[0].ref, 'Tribal Mask');
        assert.strictEqual(s.results.length, 1);

        s.doSearch(['silk', null, null, null, null]);
        assert.strictEqual(s.results.length, 12);

        const titles = s.results.map(x => x.ref);
        assert.ok(titles.indexOf('Lama Marpa Chokyi Lodro Tapestry') > -1);
        assert.ok(titles.indexOf('Vajrasattva Tapestry') > -1);
    });

    it('behaves correctly when searching with multi-word terms', function() {
        var s = new Search(items);
        s.doSearch(['Vajrasattva Tapestr', null, null, null, null]);
        assert.strictEqual(s.results.length, 1);
        assert.strictEqual(s.results[0].ref, 'Vajrasattva Tapestry');

        //s.doSearch(['Vajrasattva Tapestry', null, null, null, null]);
        // TODO: Why are results 0 when term is complete??
        //assert.strictEqual(s.results.length, 2);
        //assert.strictEqual(s.results[0].ref, 'Vajrasattva Tapestry');
        //assert.strictEqual(s.results[1].ref, 'The Heroic Being Vajrasattva ');

        s.doSearch(['', null, null, 'RubinMuseumofArt', null]);
        const titles = s.results.map(x => x.ref);
        assert.strictEqual(s.results.length, 16);
        assert.ok(titles.indexOf('Mahakala, Dance Apron') > -1);
    });

    it('can search on multiple facets', function() {
        var s = new Search(items);
        s.doSearch(['black', null, 'Amdo', null, null]);
        assert.strictEqual(s.results[0].ref, 'Black Tent');
        assert.strictEqual(s.results.length, 1);

        s.doSearch(['Black Tent', null, 'Amdo', null, null]);
        assert.strictEqual(s.results[0].ref, 'Black Tent');
        assert.strictEqual(s.results.length, 1);

        s.doSearch(['tent', null, 'Amdo', null, null]);
        assert.strictEqual(s.results[0].ref, 'Black Tent');
        assert.strictEqual(s.results.length, 1);

        s.doSearch(['', null, 'amdo', null, null]);
        assert.strictEqual(s.results.length, 23);
        let titles = s.results.map(x => x.ref);
        assert.ok(titles.indexOf('Side Hall, Tsenpo Monastery'));
        assert.ok(titles.indexOf('Black Tent') > -1);
        assert.ok(titles.indexOf('Painted Bones') > -1);

        s.doSearch(['', null, 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 23);
        titles = s.results.map(x => x.ref);
        assert.ok(titles.indexOf('Side Hall, Tsenpo Monastery'));
        assert.ok(titles.indexOf('Black Tent') > -1);
        assert.ok(titles.indexOf('Painted Bones') > -1);

        s.doSearch(['', '21st', 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 2);
        titles = s.results.map(x => x.ref);
        assert.ok(titles.indexOf('Painted Bones') > -1);

        s.doSearch(['', '20th', 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 10);
        titles = s.results.map(x => x.ref);
        assert.ok(titles.indexOf('Protector Deity Wall Mural') > -1);
        assert.ok(titles.indexOf('Black Tent') > -1);
    });
});
