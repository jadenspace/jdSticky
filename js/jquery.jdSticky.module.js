export function JdSticky(selector, options) {
    this.isIEVer = (function () {
        var rv = true;
        if (window.navigator.appName === 'Microsoft Internet Explorer') {
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(window.navigator.userAgent) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    })();
    this.$elem = $(selector);
    this._options = null;
    this.isStickyIn = false;
    this.isStickyOut = false;
    this.isStickyMoving = false;
    this.initOptions(options || {});
    this._polyfill();
    this.event();
}

JdSticky.prototype._polyfill = function () {
    (function() {
        var lastTime = 0,
            vendors = ['webkit', 'moz'],
            x = 0;

        for(; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                    id = window.setTimeout(function() { callback(currTime + timeToCall); },
                        timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());

    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== 'function') {
                // ECMAScript 5 내부 IsCallable 함수와
                // 가능한 가장 가까운 것
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs   = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP    = function() {},
                fBound  = function() {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            if (this.prototype) {
                // Function.prototype은 prototype 속성이 없음
                fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

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
        $delegate: options.$delegate ? $(options.$delegate) : $('.layout'),
        $parent: options.$parent ? $(options.$parent) : this.$elem.parent(),
        $child: options.$child ? $(options.$child) : this.$elem.children(),
        $list: options.$list || '.nav-list',
        secUse: options.secUse || false,
        setClass: options.setClass || 'on',
        btnClass: options.btnClass || 'btn-move-sec',
        duration: options.duration || 500,
        easing: options.easing || 'ease',
        $easing: options.$easing || 'swing',
        callback: options.callback || function (isSticky) {}
    };
};

JdSticky.prototype.init = function () {
    this.$elem[0].style.position = '';
    this.$elem[0].style.top = '';
    this._options.$parent[0].style.position = '';
    this._options.$child[0].style.position = '';
    this._options.$child[0].style.top = '';
    this._options.$child[0].style.width = '';
    this.$elem = null;
    this._options = null;
    this.isStickyIn = null;
    this.isStickyOut = null;
    this.isStickyMoving = null;
    $(this._options.$list + ' > li.' + this._options.setClass).removeClass(this._options.setClass);
};

JdSticky.prototype.cssExtract = function (elem) {
    var computed = window.getComputedStyle ? window.getComputedStyle(elem, null) : elem.style,
        duration = computed.transitionDuration || computed.webkitTransitionDuration;
    return typeof duration === 'string' && duration.length ? parseFloat(duration) : duration;
};
JdSticky.prototype.update = function () {
    this.move();
    if (this._options.secUse && !this.isStickyMoving) {
        this.on();
    }
};
JdSticky.prototype.move = function () {
    var st = $(window).scrollTop(),
        topSt = $(window).scrollTop() + (this.$elem[0].getBoundingClientRect().top || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0),
        bottomSt = topSt + this._options.$parent[0].clientHeight - this.$elem[0].clientHeight;

    function childStyleSet(positionVal, topVal, widthVal) {
        this._options.$child[0].style.position = positionVal;
        this._options.$child[0].style.top = topVal;
        this._options.$child[0].style.width = widthVal;
    }
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
        this._options.$parent[0].style.position = 'relative';
        childStyleSet.call(this,'absolute',(this._options.$parent[0].clientHeight - this.$elem[0].clientHeight) + 'px','100%');
        this._options.callback(!this.isStickyOut);
    } else if (st < bottomSt && this.isStickyOut) {
        this.isStickyOut = false;
        this._options.$parent[0].style.position = '';
        childStyleSet.call(this,'fixed',0,'100%');
        this._options.callback(!this.isStickyOut);
    }
};
JdSticky.prototype.on = function () {
    var self = this,
        $li = $(this._options.$list + ' > li'),
        len = $li.length,
        st = $(window).scrollTop(),
        tops = [],
        i = 0,
        j = 0;

    for (; i < len; i++) {
        var id = $('.'+this._options.btnClass)[i].hash.substr(1);
        tops[i] = document.getElementById(id).offsetTop;
    }
    if (len > 0 && st >= tops[len - 1]) {
        $li.eq(-1).addClass(self._options.setClass).siblings().removeClass(self._options.setClass);
    } else {
        while (j < len) {
            if (st < tops[j]) {
                $li.eq(Math.max(0, j-1)).addClass(self._options.setClass).siblings().removeClass(self._options.setClass);
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
            var st = $(window).scrollTop(),
                delegateEl = self._options.$delegate[0];

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
                    ['transitionend', 'webkitTransitionend'].forEach(function (elem) {
                        delegateEl.addEventListener(elem, transitionendFn);
                    });
                });
            } else {
                transitionendFn();
            }
            function transitionendFn() {
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
            }
        };

    this.$elem.on('click', '.' + self._options.btnClass, function () {
        var $thisLi = $(this).closest('li'),
            setTop = Math.ceil($(window).scrollTop() + document.getElementById(this.hash.substr(1)).getBoundingClientRect().top - (document.documentElement.clientTop || 0));

        if (setTop !== $(window).scrollTop()) {
            self.isStickyMoving = true;
            $thisLi.addClass(self._options.setClass).siblings().removeClass(self._options.setClass);
            if (self.isIEVer > 9 || self.isIEVer === true) {
                smoothScroll(setTop);
            } else {
                $('html,body').stop().animate({
                    scrollTop: setTop + 'px'
                }, {
                    duration: self._options.duration,
                    easing: self._options.$easing,
                    complete: function() {
                        self.isStickyMoving = false;
                    }
                });
            }
        }
        return false;
    });
};

JdSticky.prototype.event = function () {
    var self = this;
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        this.update();
    } else if (window.addEventListener) {
        document.addEventListener('DOMContentLoaded', this.update.bind(this));
    } else {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState === 'complete') self.update();
        });
    }
    if (window.addEventListener) {
        window.addEventListener('resize', this.update.bind(this));
        window.addEventListener('scroll', this.update.bind(this));
    } else {
        window.attachEvent('onresize', this.update.bind(this));
        window.attachEvent('onscroll', this.update.bind(this));
    }
    if (this._options.secUse) {
        this.click();
    }
};