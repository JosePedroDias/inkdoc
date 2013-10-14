/*Ink.requireModules(
    ['Ink.Net.Ajax.1', 'Ink.Dom.Selector.1'],
    function(Ajax, Selector) {
        console.log('...');*/



        var Ajax     = Ink.Net.Ajax;
        var Aux      = Ink.UI.Aux;
        var Css      = Ink.Dom.Css;
        var Element  = Ink.Dom.Element;
        var Event    = Ink.Dom.Event;
        var Selector = Ink.Dom.Selector;
        var Aux      = Ink.UI.Aux;



        var escapeHash = function(hash) {
            if (hash[0] === '.') {
                hash = hash.substring(1);
            }
            return hash.replace(/\./g, '_');
        };



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
            }, Element.data(this._el));

            this._options = Ink.extendObj( this._options, options || {});

            Event.observe(this._el, 'keyup', Ink.bindEvent(this._onKeyUp, this) );

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

            _onKeyUp: function(ev) {
                if (ev.keyCode === 27) {
                    Event.stop(ev);
                    this._el.value = '';
                    return this.hide();
                }

                this.test();
            },

            _onClick: function(ev) {
                this.hide();
                this._el.focus();

                var el = Event.element(ev);
                el = Element.findUpwardsByTag(el, 'li');
                //console.log(el);
                Event.stop(ev);
                var index = Aux.childIndex(el);
                var item = this._results[index];
                //console.log(item);

                if (item[5]) {
                    var ancestors = item[5].split(' ');
                    location.hash = '#' + escapeHash( ancestors.shift() );
                    setTimeout(function() {
                        location.hash = '#' + item[4];
                    }, 1000);
                }
                else {
                    location.hash = '#' + item[4];
                }
            }
        };



        var err = function() {
            console.log('error', arguments);
        };



        var fetchToElement = function(uri, selDestination) {
            new Ajax(uri, {
                method: 'GET',
                onSuccess: function(tmp, data) {
                    var destEl = Ink.s(selDestination);
                    destEl.innerHTML = data;
                },
                onException: err,
                onTimeout:   err,
                onFailure:   err
            });
        };



        fetchToElement('modules.html', '.left-part');

        Event.observe(window, 'hashchange', function(ev) {
            var hash = location.hash.substring(1);
            //console.log('hash', hash);

            if (Ink.s('a[name="' + hash + '"]')) {
                return;
            }

            Event.stop(ev);
            Ink.s('.main-part').scrollTop = 0;
            fetchToElement(hash + '.html', '.main-part');
        });



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
