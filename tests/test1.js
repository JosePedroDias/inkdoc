'use strict';

/*jshint unused:false */

/**
 * Hello world from **my** module! 
 *
 * @module MyModule
 * @version 1
 * @author a AT b.com
 * @since July 2013
 */

/**
 * single function test
 *
 * @function singleFunction
 * @param a qwegqwegqwegqweg
 * @param {String} b qwegqwegqweg
 * @param {Object} [o] asdasf qwf qwf
 * @param {Number} [o.n] asda sd
 * @returns {Number} asda sda sd
 */
var singleFunction = function(b, o) {};

/**
 * stuff for var
 * 
 * @variable {Number} abc qfqwf qwfq wf
 */
var abc = 2;

/**
 * stuff for class A
 * 
 * @class AA.BB.CdeClass
 *
 * @constructor
 * @param {String} a a b c
 * @param {Number} b b c d
 */
var CdeClass = function(a, b) {};

CdeClass.prototype = {
    /**
     * egqw gjqwegqwjeg qwoejg qwpegjo q
     *
     * @method asd
     * @param {Array} arr qwfqwfqwfq w
     * @param {Function} cb asdqw fqwf qwf
     * @async
     *
     * @example
     * CdeClass cde('asd', asd);
     * cde.def({a, b}); // cenas
     */
    asd: function(arr, cb) {},

    /**
     * egqw gjqwegqwjeg qwoejg qwpegjo q
     *
     * @method asd2
     * @param {Array} arr qwfqwfqwfq w
     * @param {Function} cb asdqw fqwf qwf
     */
    asd2: function(arr, cb) {},

    /**
     * yo yo
     * 
     * @property {Number} abc afq qw pgjwegpw je gpo
     */
    abc: 2,

    /**
     * yo yo 2
     * 
     * @property abc2 asdqw fq fjqw fiqwf 
     * @type Number
     * @default 4
     */
    abc2: 4,
};


/**
 * Hello world from **my** *other* module! 
 *
 * @module MyOtherModule
 * @version 1
 * @author a AT b.com
 * @since July 2013
 *
 * @uses MyModule
 */

/**
 * @namespace AEIOU
 */
var AEIOU = {

    /**
     * @function abc
     */
    abc: function() {

    },

    /**
     * stuff for var
     * 
     * @variable {Number} c qfqwf qwfq wf
     */
    c: 3
};
