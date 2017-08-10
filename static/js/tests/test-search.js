/* eslint-env node */
/* eslint-env mocha */

var assert = require('assert');
var Search = require('../src/search.js').Search;

var items = [
    {
        'title': 'Tribal Mask',
        'date': '2017-05-08 16:40:31.449926 +0000 UTC',
        'date_range': 'unknown',
        'image_date': '',
        'thumbnail': 'Rubin_C2002_5_14H065064.preview.jpg',
        'source_title': 'Rubin Museum of Art',
        'cultural_region': 'Bhutan',
        'object_use': 'Domestic | Military or hunting | Religious',
        'material': 'Wood',
        'notes': ''
    },
    {
        'title': 'Tribal Mask',
        'date': '2017-05-08 16:40:31.449926 +0000 UTC',
        'date_range': 'unknown',
        'image_date': '',
        'thumbnail': 'Rubin_C2002_5_12H065062.preview.jpg',
        'source_title': 'Rubin Museum of Art',
        'cultural_region': '',
        'object_use': 'Domestic | Military or hunting | Religious',
        'material': 'Wood',
        'notes': ''
    },
    {
        'title': 'Zoe ND 3',
        'date': '2017-04-24 16:40:58.166347 +0000 UTC',
        'date_range': '',
        'image_date': '',
        'thumbnail': 'Zoe NO DATA 3.preview.jpg',
        'source_title': '',
        'cultural_region': '',
        'object_use': 'Other',
        'material': '',
        'notes': 'Open for metadata submission.'
    },
    {
        'title': 'Black Tent',
        'date': '2017-04-24 16:40:57.092001 +0000 UTC',
        'date_range': '20th',
        'image_date': '',
        'thumbnail': 'Zoe 3.preview.jpg',
        'source_title': 'Sha bo sgrol ma ཤ་བོ་སྒྲོལ་མ། (Zoe) Private Collection',
        'cultural_region': 'Amdo',
        'object_use': 'Domestic | Other',
        'material': 'Wood | Wool',
        'notes': 'Open for metadata submission.'
    },
    {
        'title': 'Flint',
        'date': '2017-04-24 16:40:56.507355 +0000 UTC',
        'date_range': '20th',
        'image_date': '',
        'thumbnail': 'Zoe 1.preview.jpg',
        'source_title': 'Sha bo sgrol ma ཤ་བོ་སྒྲོལ་མ། (Zoe) Private Collection',
        'cultural_region': 'Amdo',
        'object_use': 'Domestic',
        'material': 'Iron | Leather | Metal (generic) | Stone',
        'notes': 'Open for metadata submission.'
    },
    {
        'title': 'Hair Ornaments ',
        'date': '2017-04-24 16:40:48.631778 +0000 UTC',
        'date_range': '21st',
        'image_date': '',
        'thumbnail': 'Tanya 1.preview.jpg',
        'source_title': 'བསྟན་འཛིན་གཡུ་སྒྲྲོན། Bstan ’dzin g.yu sgron (Tanya) Private Collection',
        'cultural_region': 'Amdo',
        'object_use': 'Decorative | Other',
        'material': 'Silk | Textile ',
        'notes': 'Open for metadata submission.'
    },
    {
        'title': 'Lama Tapestry',
        'date': '2017-04-24 16:40:37.558051 +0000 UTC',
        'date_range': '18th',
        'image_date': '',
        'thumbnail': 'Rubin_C2006_66_586H01088.preview.jpg',
        'source_title': '',
        'cultural_region': 'China (Tibetan Sites)',
        'object_use': 'Religious',
        'material': 'Silk',
        'notes': 'Unidentified Teacher (Lama), China, Gelug lineage.'
    }
];

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
        assert.strictEqual(s.results.length, 3);

        s.doSearch(['zoe', null, null, null, null]);
        assert.strictEqual(s.results.length, 3);

        s.doSearch(['tribal', null, null, null, null]);
        assert.strictEqual(s.results[0].ref, 'Tribal Mask');
        assert.strictEqual(s.results.length, 1);

        s.doSearch(['silk', null, null, null, null]);
        assert.strictEqual(s.results.length, 2);
        assert.strictEqual(s.results[0].ref, 'Lama Tapestry');
        assert.strictEqual(s.results[1].ref, 'Hair Ornaments ');
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
        assert.strictEqual(s.results.length, 3);
        assert.strictEqual(s.results[0].ref, 'Black Tent');
        assert.strictEqual(s.results[1].ref, 'Flint');
        assert.strictEqual(s.results[2].ref, 'Hair Ornaments ');

        s.doSearch(['', null, 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 3);
        assert.strictEqual(s.results[0].ref, 'Black Tent');
        assert.strictEqual(s.results[1].ref, 'Flint');
        assert.strictEqual(s.results[2].ref, 'Hair Ornaments ');

        s.doSearch(['', '21st', 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 1);
        assert.strictEqual(s.results[0].ref, 'Hair Ornaments ');

        s.doSearch(['', '20th', 'Amdo', null, null]);
        assert.strictEqual(s.results.length, 2);
        assert.strictEqual(s.results[0].ref, 'Black Tent');
        assert.strictEqual(s.results[1].ref, 'Flint');
    });
});
