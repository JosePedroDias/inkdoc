/*jshint browser:true, node:false, laxcomma:true */
/*global Ink:false */

/*Ink.requireModules(
    ['Ink.Net.Ajax.1', 'Ink.Dom.Selector.1'],
    function(Ajax, Selector) {
        console.log('...');*/



        var Ajax     = Ink.Net.Ajax;
        var Aux      = Ink.UI.Aux;
        var Css      = Ink.Dom.Css;
        var Elem     = Ink.Dom.Element;
        var Event    = Ink.Dom.Event;
        var Selector = Ink.Dom.Selector;
        var Aux      = Ink.UI.Aux;



        var Autocomplete = function(selector, options) {
            this._el = Aux.elOrSelector(selector, '1st argument');

            this._ulEl = Ink.s('ul', this._el.parentNode);

            this._options = Ink.extendObj({
                //maxResults: 0
                itemRenderer: function(text, item) {
                    return item.toString();
                },
                isMatch: function(text, item) {
                    return text === item;
                }
            }, Elem.data(this._el));

            this._options = Ink.extendObj( this._options, options || {});

            Event.observe(this._el.parentNode, 'keyup', Ink.bindEvent(this._onKeyUp, this) );

            Event.observe(this._ulEl, 'click', Ink.bindEvent(this._onClick, this) );

            this.hide();
        };

        Autocomplete.prototype = {
            test: function() {
                var text = this._el.value.toLowerCase().trim();
                var results = [];
                var html = [];
                var len = 0;

                if (text.length === '') {
                    return this.hide();
                }

                var mdl      = this._options.model, item;
                var isMatch  = this._options.isMatch;
                var renderer = this._options.itemRenderer;
                var max      = this._options.maxResults;
                for (var i = 0, f = mdl.length; i < f; ++i) {
                    item = mdl[i];

                    if (isMatch(text, item)) {
                        results.push(item);
                        html.push( renderer(text, item) );

                        ++len;
                        if (max && len === max) {
                            break;
                        }
                    }
                }

                this._ulEl.innerHTML = html.join('');

                this._results = results;

                this.show();
            },

            show: function() {
                Css.removeClassName(this._ulEl, 'hidden');
            },

            hide: function() {
                Css.addClassName(this._ulEl, 'hidden');
            },



            _fetchPossibleFocuses: function() {
                return Selector.select('input, a', this._el.parentNode);
            },

            _onKeyUp: function(ev) {
                //console.log(ev);

                // ignore keyboard events with modifier keys
                if (ev.altKey || ev.altGraphKey || ev.ctrlKey || ev.shiftKey || ev.metaKey) {
                    return;
                }



                // autocomplete navigation
                var kCode = ev.keyCode;

                var delta = 0;
                if (kCode === 27) {
                    Event.stop(ev);
                    this._el.value = '';
                    return this.hide();
                }
                else if (kCode === 13) {
                    this.hide();
                    this._el.focus();
                    return;
                }
                else if (kCode === 38) {
                    delta = -1;
                }
                else if (kCode === 40) {
                    delta = 1;
                }

                if (delta) {
                    var els = this._fetchPossibleFocuses();
                    var len = els.length;
                    var currentEl = document.activeElement;
                    var index = els.indexOf(currentEl);
                    index += delta;
                    if      (index < 0) {    index += len; }
                    else if (index >= len) { index -= len; }
                    currentEl = els[index];
                    currentEl.focus();
                    return;
                }



                // check which autocomplete results match and display them
                this.test();
            },

            _onClick: function(ev) {
                var el = Event.element(ev);

                this.hide();
                this._el.focus();

                if (el === this._el) {
                    return;
                }
                
                var els = this._fetchPossibleFocuses();
                els.shift(); // get rid of input
                var index = els.indexOf(el);

                if (this._options.onSuggestionActivated) {
                    this._options.onSuggestionActivated(el, this._results[index]);
                }
            }
        };



        var err = function() {
            console.log('error', arguments);
        };



        var fetchToElement = function(uri, selDestination, cb) {
            new Ajax(uri, {
                method: 'GET',
                onSuccess: function(tmp, data) {
                    var destEl = Ink.s(selDestination);
                    destEl.innerHTML = data;
                    if (cb) {
                        cb(null);
                    }
                },
                onException: function() { if (cb) { cb('exception'); } },
                onTimeout:   function() { if (cb) { cb('timeout');   } },
                onFailure:   function() { if (cb) { cb('failure');   } }
            });
        };



        fetchToElement('modules.html', '.left-part');

        var onHashProcessed = function(err) {
            if (err) { return console.log(err); }
            Ink.s('.main-part').scrollTop = 0;
            //var anchorEl = Ink.s('a[name="' + this + '"]');
            //console.log('anchorEl', anchorEl);
            location.hash = '#' + this;
            //console.log('focusing ' + this + '!\n');
        };

        var processHash = function(hash, ev) {
            if (Ink.s('a[name="' + hash + '"]')) {
                return;//console.log('found anchor ' + hash + ' locally!\n');
            }

            if (ev) {
                Event.stop(ev);
            }

            var parts = hash.split('-');
            var cb = Ink.bind(onHashProcessed, hash);
            if (parts.length > 1) {
                location.hash = '#';
                fetchToElement(parts[0] + '.html', '.main-part', cb);
                return;//console.log('composed hash, fetching ' + parts[0] + ' via AJAX...');
            }
            fetchToElement(hash + '.html', '.main-part', cb);
            //console.log('module hash, fetching ' + hash + '!\n');
        };

        var onHashChange = function(ev) {
            var hash = location.hash;
            if (!hash || hash.length < 2) { return; }
            hash = hash.substring(1);
            processHash(hash, ev);
        };

        Event.observe(window, 'hashchange', onHashChange);

        onHashChange();



        var ac, allowedKinds = 'mcf';

        var filterMEl = Ink.s('#filter-m');
        var filterCEl = Ink.s('#filter-c');
        var filterFEl = Ink.s('#filter-f');

        var onFilterChange = function() {
            allowedKinds = [
                filterMEl.checked ? 'm' : '',
                filterCEl.checked ? 'c' : '',
                filterFEl.checked ? 'f' : ''
            ].join('');
            ac.test();
        };
        Event.observe(filterMEl, 'change', onFilterChange);
        Event.observe(filterCEl, 'change', onFilterChange);
        Event.observe(filterFEl, 'change', onFilterChange);

        new Ajax('identifiers.json', {
            method: 'GET',
            onSuccess: function(tmp, model) { // item structure: 0: text compare, 1: m/c/f, 2: real name, 3: file, 4: hash, 5: ancestors
                ac = new Autocomplete('.autocomplete', {
                     model:      model
                    ,maxResults: 12
                    ,isMatch: function(text, item) {
                        return allowedKinds.indexOf(item[1]) !== -1 && item[0].indexOf(text) !== -1;
                    }
                    ,itemRenderer: function(text, item) {
                        var l = text.length;
                        var i = item[0].lastIndexOf(text);
                        var match = item[2].split('');
                        match.splice(i+l, 0, '</b>');
                        match.splice(i,   0, '<b>');
                        match = match.join('');
                        return ['<li class="', item[1], '"><a href="#', item[4], '"><span>', item[1].toUpperCase(), '</span>', item[5] ? item[5] + ' ' : '', match, '</a></li>\n'].join('');
                    }
                });
                ac._el.focus();
            },
            onException: err,
            onTimeout:   err,
            onFailure:   err
        });
/*    }
);*/
