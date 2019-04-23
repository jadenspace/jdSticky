function JdSticky(selector, options) {
    this.$elem = document.querySelector(selector);
    this._options = null;
    this.isStickyIn = false;
    this.isStickyOut = false;
    this.isStickyMoving = false;
    this.initOptions(options || {});
    this._polyfill();
    this.event();
}

JdSticky.prototype._polyfill = function () {
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            var i = 0;
            thisArg = thisArg || window;
            for (; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }
};
JdSticky.prototype.initOptions = function (options) {
    this._options = {
        $delegate: options.$delegate ? document.querySelector(options.$delegate) : document.querySelector('.layout'),
        $parent: options.$parent ? document.querySelector(options.$parent) : this.$elem.parentNode,
        $child: options.$child ? document.querySelector(options.$child) : this.$elem.firstElementChild,
        $list: options.$list || '.nav-list',
        secUse: options.secUse || false,
        setClass: options.setClass || 'on',
        btnClass: options.btnClass || 'btn-move-sec',
        duration: options.duration || 500,
        easing: options.easing || 'ease',
        callback: options.callback || function (isSticky) {}
    };
};
JdSticky.prototype.init = function () {
    this.$elem.style.position = '';
    this.$elem.style.top = '';
    this._options.$parent.style.position = '';
    this._options.$child.style.position = '';
    this._options.$child.style.top = '';
    this._options.$child.style.width = '';
    this.$elem = null;
    this._options = null;
    this.isStickyIn = null;
    this.isStickyOut = null;
    this.isStickyMoving = null;
    this.remove(document.querySelector(this._options.$list + ' > li.' + this._options.setClass));
};
JdSticky.prototype.cssExtract = function (elem) {
    var computed = window.getComputedStyle ? window.getComputedStyle(elem, null) : elem.style,
        duration = computed.transitionDuration || computed.webkitTransitionDuration;
    return typeof duration === 'string' && duration.length ? parseFloat(duration) : duration;
};
JdSticky.prototype.add = function (selector) {
    var check = new RegExp('(\\s|^)' + this._options.setClass + '(\\s|$)');
    if (!selector.className.match(check)) {
        selector.className += ' ' + this._options.setClass;
    }
};
JdSticky.prototype.remove = function (selector) {
    if (selector.className && selector.className.indexOf(this._options.setClass) !== -1) {
        var check = new RegExp('(\\s|^)' + this._options.setClass + '(\\s|$)');
        selector.className = selector.className.replace(check, ' ').trim();
    }
};
JdSticky.prototype.update = function () {
    this.move();
    if (this._options.secUse && !this.isStickyMoving) {
        this.on();
    }
};
JdSticky.prototype.move = function () {
    var st = window.pageYOffset,
        topSt = window.pageYOffset + (this.$elem.getBoundingClientRect().top || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0),
        bottomSt = topSt + this._options.$parent.clientHeight - this.$elem.clientHeight,
        childStyleSet = function(positionVal, topVal, widthVal) {
            this._options.$child.style.position = positionVal;
            this._options.$child.style.top = topVal;
            this._options.$child.style.width = widthVal;
        };

    // 상단 진입/이탈
    if (st >= topSt && !this.isStickyIn) {
        this.isStickyIn = true;
        childStyleSet.call(this,'fixed',0,'100%');
        this._options.callback(this.isStickyIn);
    } else if (st < topSt && this.isStickyIn) {
        this.isStickyIn = false;
        childStyleSet.call(this,'','','');
        this._options.callback(this.isStickyIn);
    }

    // 하단 이탈/진입
    if (st >= bottomSt && !this.isStickyOut) {
        this.isStickyOut = true;
        this._options.$parent.style.position = 'relative';
        childStyleSet.call(this,'absolute',(this._options.$parent.clientHeight - this.$elem.clientHeight) + 'px','100%');
        this._options.callback(!this.isStickyOut);
    } else if (st < bottomSt && this.isStickyOut) {
        this.isStickyOut = false;
        this._options.$parent.style.position = '';
        childStyleSet.call(this,'fixed',0,'100%');
        this._options.callback(!this.isStickyOut);
    }
};
JdSticky.prototype.on = function () {
    var self = this,
        $li = document.querySelectorAll(this._options.$list + ' > li'),
        len = $li.length,
        st = window.pageYOffset,
        tops = [],
        i = 0,
        j = 0;

    for (; i < len; i++) {
        var id = document.getElementsByClassName(this._options.btnClass)[i].hash.substr(1);
        tops[i] = document.getElementById(id).offsetTop;
    }
    if (len > 0 && st >= tops[len - 1]) {
        $li.forEach(function(a) {
            self.remove(a);
        });
        this.add($li[tops.length - 1]);
    } else {
        while (j < len) {
            if (st < tops[j]) {
                $li.forEach(function(a) {
                    self.remove(a);
                });
                this.add($li[Math.max(0, j - 1)]);
                j = len;
            } else {
                j++;
            }
        }
    }
};

JdSticky.prototype.click = function () {
    var self = this,
        smoothScroll = function(value) {
            var st = window.pageYOffset,
                delegateEl = self._options.$delegate,
                transitionendFn = function () {
                    if (self.cssExtract(delegateEl)) {
                        ['transitionend','webkitTransitionend'].forEach(function(elem) {
                            delegateEl.removeEventListener(elem, transitionendFn);
                        });
                    }
                    document.body.style.height = '';
                    delegateEl.style.position = '';
                    delegateEl.style.top = '';
                    delegateEl.style.width = '';
                    delegateEl.style.webkitTransition = '';
                    delegateEl.style.transition = '';
                    window.scrollTo(0, value);
                    self.isStickyMoving = false;
                };

            if (window.requestAnimationFrame && self.cssExtract(delegateEl) !== undefined) {
                document.body.style.height = delegateEl.offsetHeight + 'px';
                delegateEl.style.position = 'fixed';
                delegateEl.style.top = '-' + st + 'px';
                delegateEl.style.width = '100%';

                setTimeout(function() {
                    delegateEl.style.webkitTransition = 'top ' + self._options.duration + 'ms ' + self._options.easing;
                    delegateEl.style.transition = 'top ' + self._options.duration + 'ms ' + self._options.easing;
                    delegateEl.style.top = '-' + value + 'px';
                    (function loop() {
                        var start = 0,
                            last = 0,
                            timeDifference = 0,
                            setLoop = null;
                        function step(stamp) {
                            if (!start) start = stamp;
                            if (!last) last = stamp;
                            timeDifference = stamp - last;
                            if (!self.isStickyMoving) {
                                window.cancelAnimationFrame(setLoop);
                                return false;
                            }
                            if (timeDifference > 16) {
                                self.update.call(self);
                                window.scrollTo(0, -delegateEl.getBoundingClientRect().top);
                                last = stamp;
                            }
                            setLoop = window.requestAnimationFrame(step);
                        }
                        setLoop = window.requestAnimationFrame(step);
                    })();
                    ['transitionend','webkitTransitionend'].forEach(function(elem) {
                        delegateEl.addEventListener(elem, transitionendFn);
                    });
                });
            } else {
                transitionendFn();
            }
        };

    this.$elem.addEventListener('click', function (e) {
        if (e.target.className && e.target.className.indexOf(self._options.btnClass) !== -1) {
            var $thisLi = e.target.parentNode,
                setTop = Math.ceil(window.pageYOffset + document.getElementById(e.target.hash.substr(1)).getBoundingClientRect().top - (document.documentElement.clientTop || 0));

            if (setTop !== window.pageYOffset) {
                self.isStickyMoving = true;
                $thisLi.parentNode.childNodes.forEach(function (a) {
                    self.remove(a);
                });
                self.add($thisLi);
                smoothScroll(setTop);
            }
            e.preventDefault();
            e.stopPropagation();
        }
    });
};

JdSticky.prototype.event = function () {
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        this.update();
    } else if (window.addEventListener) {
        document.addEventListener('DOMContentLoaded', this.update.bind(this, true));
    }
    window.addEventListener('resize', this.update.bind(this));
    window.addEventListener('scroll', this.update.bind(this));
    if (this._options.secUse) {
        this.click();
    }
};