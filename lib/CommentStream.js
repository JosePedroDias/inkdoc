'use strict';

/**
 * @module CommentStream
 */

var EventEmitter = require('events').EventEmitter,
    Stream       = require('stream'),
    util         = require('util');



var _events = {
    comment: function(comment) {
        this.emit('comment', comment);
    },
    'non-comment': function(nonComment) {
        this.emit('non-comment', nonComment);
    },
    end: function() {
        this.emit('end');
    }
};



/**
 * @class CommentStream
 *
 * @constructor
 * @param  {Stream} underlyingStream [description]
 * @param  {String} startStr         [description]
 * @param  {String} endStr           [description]
 */
var CommentStream = function(underlyingStream, startStr, endStr) {
    if (!(this instanceof CommentStream)) {
        return new CommentStream(underlyingStream, startStr, endStr);
    }

    if (!underlyingStream) {
        throw new Error('CommentStream requires an underlying stream');
    }

    Stream.call(this);

    var self = this;

    this.underlyingStream = underlyingStream;
    this.startStr = startStr || '/*';
    this.endStr   = endStr   || '*/';

    this.inComment = false;
    this.data = '';
    this.inIndex = 0;
    this.line = 0;
    this.col  = 0;
    this.fIndex = 0;
    this.start = {at:0, line:0, col:0, fIndex:0};

    this.underlyingStream.on('data', function(chunk) {
        chunk = chunk.toString();
        var needle = this.inComment ? this.endStr : this.startStr;
        var needleL = needle.length;
        var needleC = needle[ this.inIndex ];

        var line = this.line;
        var col  = this.col;
        var emitted;

        var a, b, c, i, t, l = chunk.length;

        for (i = 0; i < l; ++i) {
            c = chunk[i];
            emitted = false;
            //console.log(i, c);

            if (c === needleC) {
                //console.log(line, col, c, this.inIndex, this.inComment ? 'N?' : 'C?');
                if (needleL - 1 === this.inIndex) {
                    emitted = true;
                    this.inComment = !this.inComment;
                    this.inIndex = 0;
                    needle = this.inComment ? this.endStr : this.startStr;
                    needleL = needle.length;
                    needleC = needle[ this.inIndex ];

                    a = this.start.at;
                    b = i-1;
                    if (!this.inComment) {
                        a -= 2;
                        b += 2;
                    }
                    t = this.inComment ? 0 : this.startStr.length;
                    this.emit(this.inComment ? 'non-comment' : 'comment', {
                        text:    this.data + chunk.substring(a, b),
                        line:    this.start.line,
                        column:  this.start.col - t,
                        index:   this.start.fIndex - t
                    });
                }
                else {
                    ++this.inIndex;
                    needleC = needle[ this.inIndex ];
                }
            }
            else {
                //if (this.inIndex !== 0) { console.log('rewind ' + needleC + ' ' + (this.inComment ? 'C' :'N') + ' @ ' + (line+1) + ',' + (col+1)); }
                this.inIndex = 0;
                needleC = needle[ this.inIndex ];
            }


            // update cursor
            if (c === '\n') {
                ++line;
                col = 0;
            }
            else {
                ++col;
            }
            ++this.fIndex;


            // update next start
            if (emitted) {
                this.data = '';
                this.start = {at:i+1, line:line, col:col, fIndex:this.fIndex};
            }
        } // end of for

        this.data = chunk.substring( this.start.at );
        this.start.at = 0;

        this.line = line;
        this.col  = col;
    }.bind(this));

    this.underlyingStream.on('end',  function() {
        if (this.data) {
            this.emit('non-comment', {
                text:    this.data,
                line:    this.start.line,
                column:  this.start.col,
                index:   this.start.fIndex
            });
        }

        _events.end.call(self);
    }.bind(this));

    Object.defineProperty(this, 'readable', {
        get: function() {
            return self.underlyingStream.readable;
        },
        enumerable: true
    });

    Object.defineProperty(this, 'paused', {
        get: function() {
            return self.underlyingStream.paused;
        },
        enumerable: true
    });
};

util.inherits(CommentStream, Stream);



// starts overriding EventEmitter methods so we can pass through to underlyingStream
// If we get a request for an event we don't know about, pass it to the underlyingStream

CommentStream.prototype.addListener = function(type, listener) {
    if (!(type in _events)) {
        this.underlyingStream.on(type, listener);
    }
    EventEmitter.prototype.on.call(this, type, listener);

    return this;
};

CommentStream.prototype.on = CommentStream.prototype.addListener;

CommentStream.prototype.removeListener = function(type, listener) {
    if (!(type in _events)) {
        this.underlyingStream.removeListener(type, listener);
    }
    EventEmitter.prototype.removeListener.call(this, type, listener);

    return this;
};

CommentStream.prototype.removeAllListeners = function(type) {
    if (!(type in _events)) {
        this.underlyingStream.removeAllListeners(type);
    }
    EventEmitter.prototype.removeAllListeners.call(this, type);

    return this;
};



// passthrough of Readable Stream methods for underlying stream

CommentStream.prototype.pause = function() {
    if (this.underlyingStream.pause) {
        this.underlyingStream.pause();
    }

    return this;
};

CommentStream.prototype.resume = function() {
    if (this.underlyingStream.resume) {
        this.underlyingStream.resume();
    }

    return this;
};

CommentStream.prototype.destroy = function() {
    if (this.underlyingStream.destroy) {
        this.underlyingStream.destroy();
    }

    return this;
};

CommentStream.prototype.setEncoding = function(encoding) {
    if(this.underlyingStream.setEncoding) {
        this.underlyingStream.setEncoding(encoding);
    }

    return this;
};




CommentStream.prototype.setDelimiter = function(delimiter) {
    this.delimiter = delimiter;

    return this;
};

module.exports = CommentStream;
