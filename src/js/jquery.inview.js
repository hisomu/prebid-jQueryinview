/**
 * author Remy Sharp
 * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 * fork https://github.com/zuk/jquery.inview
 */
(function ($) {
    'use strict';

    function getScrollTop() {
        return window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop;
    }

    function getViewportHeight() {
        var height = window.innerHeight; // Safari, Opera
        // if this is correct then return it. iPad has compat Mode, so will
        // go into check clientHeight (which has the wrong value).
        if (height) {
            return height;
        }
        var mode = document.compatMode;

        if ((mode || !$.support.boxModel)) { // IE, Gecko
            height = (mode === 'CSS1Compat') ?
                document.documentElement.clientHeight : // Standards
                document.body.clientHeight; // Quirks
        }

        return height;
    }

    function offsetTop(debug) {
        // Manually calculate offset rather than using jQuery's offset
        // This works-around iOS < 4 on iPad giving incorrect value
        // cf http://bugs.jquery.com/ticket/6446#comment:9
        var curtop = 0;
        for (var obj = debug; obj; obj = obj.offsetParent) {
            curtop += obj.offsetTop;
        }
        return curtop;
    }

    function getHeight(el) {
        var styles = window.getComputedStyle(el);
        var height = el.offsetHeight;
        var borderTopWidth = parseFloat(styles.borderTopWidth);
        var borderBottomWidth = parseFloat(styles.borderBottomWidth);
        var paddingTop = parseFloat(styles.paddingTop);
        var paddingBottom = parseFloat(styles.paddingBottom);
        return height - borderBottomWidth - borderTopWidth - paddingTop - paddingBottom;
    }

    var _lastDirection = document.body.scrollTop;

    function checkInView() {
        var viewportTop = getScrollTop(),
            viewportBottom = viewportTop + getViewportHeight();

        $('.inview').each(function () {
            var $el = $(this),
                elTop = offsetTop(this),
                elHeight = getHeight(this),
                elBottom = elTop + elHeight,
                wasInView = $el.data('inview') || false,
                offset = $el.data('offset') || 0,
                index = $el.data('articleindex') || 0,
                lastScrollTop = $el.data('lastScrollTop') || _lastDirection,
                inView = elTop >= viewportTop && elBottom <= viewportBottom,
                isBottomVisible = elBottom + offset >= viewportTop && elTop <= viewportTop,
                isTopVisible = elTop - offset <= viewportBottom && elBottom >= viewportBottom,
                inViewWithOffset = inView || isBottomVisible || isTopVisible ||
                    (elTop <= viewportTop && elBottom >= viewportBottom),
                isForward = document.body.scrollTop > lastScrollTop,
                trigger = $el.data('trigger') || 'inview';

            if (inViewWithOffset) {
                var visPart = (isTopVisible && isBottomVisible && 'neither') || (isTopVisible && 'top') || (isBottomVisible && 'bottom') || 'both';
                if (!wasInView || wasInView !== visPart) {
                    _lastDirection = document.body.scrollTop;
                    $el.data('inview', visPart);
                    $el.data('lastScrollTop', _lastDirection);
                    $el.trigger(trigger, [true, index, visPart, isForward ? 'down' : 'up']);

                }
            } else if (!inView && wasInView) {
                $el.data('inview', false);
                $el.data('lastScrollTop', document.body.scrollTop);
                $el.trigger(trigger, [false]);

            }
        });
    }

    function createFunctionLimitedToOneExecutionPerDelay(fn, delay) {
        var shouldRun = false;
        var timer = null;

        function runOncePerDelay() {
            if (timer !== null) {
                shouldRun = true;
                return;
            }
            shouldRun = false;
            fn();
            timer = setTimeout(function () {
                timer = null;
                if (shouldRun) {
                    runOncePerDelay();
                }
            }, delay);
        }

        return runOncePerDelay;
    }

    // ready.inview kicks the event to pick up any elements already in view.
    // note however, this only works if the plugin is included after the elements are bound to 'inview'
    var runner = createFunctionLimitedToOneExecutionPerDelay(checkInView, 250);
    $(window).on('checkInView.inview click.inview ready.inview scroll.inview resize.inview', runner);

})(jQuery);