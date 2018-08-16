(function(){
/*
 * Puts close button at top
 * Also fixes counter starting from zero (as of 14 Dec 2009)
 */
    var S = Shadowbox,
    U = S.util,

//Wizzud...
		_closeTop = {hide:0, show:0},

    /**
     * Keeps track of whether or not the overlay is activated.
     *
     * @var     Boolean
     * @private
     */
    overlay_on = false,

    /**
     * A cache of elements that are troublesome for modal overlays.
     *
     * @var     Array
     * @private
     */
    visibility_cache = [],

    /**
     * Id's of elements that need transparent PNG support in IE6.
     *
     * @var     Array
     * @private
     */
    png = [
        'sb-nav-close',
        'sb-nav-next',
        'sb-nav-play',
        'sb-nav-pause',
        'sb-nav-previous'
    ],

    // the Shadowbox.skin object
    K = {

        /**
         * The HTML markup to use.
         *
         * @var     String
         * @public
         */
        markup: '<div id="sb-container">' +
                    '<div id="sb-overlay"></div>' +
                    '<div id="sb-wrapper">' +
                        '<div id="sb-title">' +
                            '<div id="sb-title-inner"></div>' +
                        '</div>' +
//Wizzud...
                        '<a id="sb-nav-close" title="{close}" onclick="Shadowbox.close()"></a>' +
                        '<div id="sb-body">' +
                            '<div id="sb-body-inner"></div>' +
                            '<div id="sb-loading">' +
                                '<a onclick="Shadowbox.close()">{cancel}</a>' +
                            '</div>' +
                        '</div>' +
                        '<div id="sb-info">' +
                            '<div id="sb-info-inner">' +
                                '<div id="sb-counter"></div>' +
                                '<div id="sb-nav">' +
//Wizzud...
//                                    '<a id="sb-nav-close" title="{close}" onclick="Shadowbox.close()"></a>' +
                                    '<a id="sb-nav-next" title="{next}" onclick="Shadowbox.next()"></a>' +
                                    '<a id="sb-nav-play" title="{play}" onclick="Shadowbox.play()"></a>' +
                                    '<a id="sb-nav-pause" title="{pause}" onclick="Shadowbox.pause()"></a>' +
                                    '<a id="sb-nav-previous" title="{previous}" onclick="Shadowbox.previous()"></a>' +
                                '</div>' +
                                '<div style="clear:both"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',

        /**
         * Options that are specific to the skin.
         *
         * @var     Object
         * @public
         */
        options: {

            animSequence: 'sync',   // the sequence of the resizing animations. "hw" will resize
                                    // height, then width. "wh" resizes width, then height. "sync"
                                    // resizes both simultaneously
            autoDimensions: false,  // use the dimensions of the first piece as the initial dimensions
                                    // if they are available
            counterLimit: 10,       // limit to the number of counter links that
                                    // are displayed in a "skip" style counter
            counterType: 'default', // counter type. May be either "default" or
                                    // "skip". Skip counter displays a link for
                                    // each item in gallery
            displayCounter: true,   // display the gallery counter
            displayNav: true,       // show the navigation controls
            fadeDuration: 0.35,     // duration of the fade animations (in seconds)
            initialHeight: 160,     // initial height (pixels)
            initialWidth: 320,      // initial width (pixels)
            modal: false,           // trigger Shadowbox.close() when overlay is
                                    // clicked
            overlayColor: '#000',   // color to use for modal overlay
            overlayOpacity: 0.8,    // opacity to use for modal overlay
            resizeDuration: 0.35,   // duration of the resizing animations (in seconds)
            showOverlay: true,      // show the overlay
            troubleElements: ['select', 'object', 'embed', 'canvas']  // names of elements that are
                                                                      // troublesome for modal overlays

        },

        /**
         * Initialization function. Called immediately after this skin's markup
         * has been appended to the document with all of the necessary language
         * replacements done.
         *
         * @return  void
         * @public
         */
        init: function(){
            // append markup to body
            var markup = K.markup.replace(/\{(\w+)\}/g, function(m, p){
                return S.lang[p];
            });
            S.lib.append(document.body, markup);

            // several fixes for IE6
            if(S.client.isIE6){
                // trigger hasLayout on sb-body
                U.get('sb-body').style.zoom = 1;

                // support transparent PNG's via AlphaImageLoader
                var el, m, re = /url\("(.*\.png)"\)/;
                U.each(png, function(id){
                    el = U.get(id);
                    if(el){
                        m = S.lib.getStyle(el, 'backgroundImage').match(re);
                        if(m){
                            el.style.backgroundImage = 'none';
                            el.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src=' +
                                m[1] + ',sizingMethod=scale);';
                        }
                    }
                });
            }

            // set up window resize event handler
            var id;
            S.lib.addEvent(window, 'resize', function(){
                // use 50 ms event buffering to prevent jerky window resizing
                if(id){
                    clearTimeout(id);
                    id = null;
                }
                // check if activated because IE7 fires window resize event
                // when container display is set to block
                if(S.isActive()){
                    id = setTimeout(function(){
                        K.onWindowResize();
                        var c = S.content;
                        if(c && c.onWindowResize)
                            c.onWindowResize();
                    }, 50);
                }
            });
        },

        /**
         * Gets the element that content should be appended to.
         *
         * @return  HTMLElement     The body element
         * @public
         */
        bodyEl: function(){
            return U.get('sb-body-inner');
        },

        /**
         * Called when Shadowbox opens from an inactive state.
         *
         * @param   Object      obj     The object to open
         * @param   Function    cb      The function to call when finished
         * @return  void
         * @public
         */
        onOpen: function(obj, cb){
            toggleTroubleElements(false);

            var h = S.options.autoDimensions && 'height' in obj
                ? obj.height
                : S.options.initialHeight,
                w = S.options.autoDimensions && 'width' in obj
                ? obj.width
                : S.options.initialWidth;

            U.get('sb-container').style.display = 'block';

            var d = setDimensions(h, w);
            adjustHeight(d.inner_h, d.top, false);
            adjustWidth(d.width, d.left, false);
            toggleVisible(cb);
        },

        /**
         * Called when a new piece of content is being loaded.
         *
         * @param   mixed       content     The content object
         * @param   Boolean     change      True if the content is changing
         *                                  from some previous content
         * @param   Function    cb          A callback that should be fired when
         *                                  this function is finished
         * @return  void
         * @public
         */
        onLoad: function(content, change, cb){
            toggleLoading(true);

            hideBars(change, function(){ // if changing, animate the bars transition
                if(!content) return;

                // if opening, clear #sb-wrapper display
                if(!change) U.get('sb-wrapper').style.display = '';

                cb();
            });
        },

        /**
         * Called when the content is ready to be loaded (e.g. when the image
         * has finished loading). Should resize the content box and make any
         * other necessary adjustments.
         *
         * @param   Function    cb          A callback that should be fired when
         *                                  this function is finished
         * @return  void
         * @public
         */
        onReady: function(cb){
            var c = S.content;
            if(!c) return;

            // set new dimensions
            var d = setDimensions(c.height, c.width, c.resizable);

            K.resizeContent(d.inner_h, d.width, d.top, d.left, true, function(){
                showBars(cb);
            });
        },

        /**
         * Called when the content is loaded into the box and is ready to be
         * displayed.
         *
         * @param   Function    cb          A callback that should be fired when
         *                                  this function is finished
         * @return  void
         * @public
         */
        onFinish: function(cb){
            toggleLoading(false, cb);
        },

        /**
         * Called when Shadowbox is closed.
         *
         * @return  void
         * @public
         */
        onClose: function(){
            toggleVisible();
            toggleTroubleElements(true);
        },

        /**
         * Called in Shadowbox.play().
         *
         * @return  void
         * @public
         */
        onPlay: function(){
            toggleNav('play', false);
            toggleNav('pause', true);
        },

        /**
         * Called in Shadowbox.pause().
         *
         * @return  void
         * @public
         */
        onPause: function(){
            toggleNav('pause', false);
            toggleNav('play', true);
        },

        /**
         * Called when the window is resized.
         *
         * @return  void
         * @public
         */
        onWindowResize: function(){
            var c = S.content;
            if(!c) return;

            // set new dimensions
            var d = setDimensions(c.height, c.width, c.resizable);

            adjustWidth(d.width, d.left, false);
            adjustHeight(d.inner_h, d.top, false);

            var el = U.get(S.contentId());
            if(el){
                // resize resizable content when in resize mode
                if(c.resizable && S.options.handleOversize == 'resize'){
                    el.height = d.resize_h;
                    el.width = d.resize_w;
                }
            }
        },

        /**
         * Resizes Shadowbox to the appropriate height and width for the current
         * content.
         *
         * @param   Number      height  The new height to use
         * @param   Number      width   The new width to use
         * @param   Number      top     The new top to use
         * @param   Number      left    The new left to use
         * @param   Boolean     anim    True to animate the transition
         * @param   Function    cb      A callback function to execute after the
         *                              resize completes
         * @return  void
         * @public
         */
        resizeContent: function(height, width, top, left, anim, cb){
            var c = S.content;
            if(!c) return;

            // set new dimensions
            var d = setDimensions(c.height, c.width, c.resizable);

            switch(S.options.animSequence){
                case 'hw':
                    adjustHeight(d.inner_h, d.top, anim, function(){
                        adjustWidth(d.width, d.left, anim, cb);
                    });
                break;
                case 'wh':
                    adjustWidth(d.width, d.left, anim, function(){
                        adjustHeight(d.inner_h, d.top, anim, cb);
                    });
                break;
                default: // sync
                    adjustWidth(d.width, d.left, anim);
                    adjustHeight(d.inner_h, d.top, anim, cb);
            }
        }

    };

    /**
     * Sets the top of the container element. This is only necessary in IE6
     * where the container uses absolute positioning instead of fixed.
     *
     * @return  void
     * @private
     */
    function fixTop(){
        U.get('sb-container').style.top = document.documentElement.scrollTop + 'px';
    }

    /**
     * Toggles the visibility of elements that are troublesome for modal
     * overlays.
     *
     * @return  void
     * @private
     */
    function toggleTroubleElements(on){
        if(on){
            U.each(visibility_cache, function(c){
                c[0].style.visibility = c[1] || '';
            });
        }else{
            visibility_cache = [];
            U.each(S.options.troubleElements, function(tag){
                U.each(document.getElementsByTagName(tag), function(el){
                    visibility_cache.push([el, el.style.visibility]);
                    el.style.visibility = 'hidden';
                });
            });
        }
    }

    /**
     * Toggles the visibility of #sb-container and sets its size (if on
     * IE6). Also toggles the visibility of elements (<select>, <object>, and
     * <embed>) that are troublesome for semi-transparent modal overlays. IE has
     * problems with <select> elements, while Firefox has trouble with
     * <object>s.
     *
     * @param   Function    cb      A callback to call after toggling on, absent
     *                              when toggling off
     * @return  void
     * @private
     */
    function toggleVisible(cb){
        var so = U.get('sb-overlay'),
            sc = U.get('sb-container'),
            sb = U.get('sb-wrapper');

        if(cb){
            if(S.client.isIE6){
                // fix container top before showing
                fixTop();
                S.lib.addEvent(window, 'scroll', fixTop);
            }
            if(S.options.showOverlay){
                overlay_on = true;

                // set overlay color/opacity
                so.style.backgroundColor = S.options.overlayColor;
                U.setOpacity(so, 0);
                if(!S.options.modal) S.lib.addEvent(so, 'click', S.close);

                sb.style.display = 'none'; // cleared in onLoad
            }
            sc.style.visibility = 'visible';
            if(overlay_on){
                // fade in effect
                var op = parseFloat(S.options.overlayOpacity);
                U.animate(so, 'opacity', op, S.options.fadeDuration, cb);
            }else
                cb();
        }else{
            if(S.client.isIE6)
                S.lib.removeEvent(window, 'scroll', fixTop);
            S.lib.removeEvent(so, 'click', S.close);
            if(overlay_on){
                // fade out effect
                sb.style.display = 'none';
                U.animate(so, 'opacity', 0, S.options.fadeDuration, function(){
                    // the following is commented because it causes the overlay to
                    // be hidden on consecutive activations in IE8, even though we
                    // set the visibility to "visible" when we reactivate
                    //sc.style.visibility = 'hidden';
                    sc.style.display = '';
                    sb.style.display = '';
                    U.clearOpacity(so);
                });
            }else
                sc.style.visibility = 'hidden';
        }
    }

    /**
     * Toggles the display of the nav control with the given id.
     *
     * @param   String      id      The id of the navigation control
     * @param   Boolean     on      True to toggle on, false to toggle off
     * @return  void
     * @private
     */
    function toggleNav(id, on){
        var el = U.get('sb-nav-' + id);
        if(el) el.style.display = on ? '' : 'none';
    }

    /**
     * Toggles the visibility of the "loading" layer.
     *
     * @param   Boolean     on      True to toggle on, false to toggle off
     * @param   Function    cb      The callback function to call when toggling
     *                              completes
     * @return  void
     * @private
     */
    function toggleLoading(on, cb){
        var ld = U.get('sb-loading'),
            p = S.getCurrent().player,
            anim = (p == 'img' || p == 'html'); // fade on images & html

        if(on){
            function fn(){
                U.clearOpacity(ld);
                if(cb) cb();
            }

            U.setOpacity(ld, 0);
            ld.style.display = '';

            if(anim)
                U.animate(ld, 'opacity', 1, S.options.fadeDuration, fn);
            else
                fn();
        }else{
            function fn(){
                ld.style.display = 'none';
                U.clearOpacity(ld);
                if(cb) cb();
            }

            if(anim)
                U.animate(ld, 'opacity', 0, S.options.fadeDuration, fn);
            else
                fn();
        }
    }

    /**
     * Builds the content for the title and information bars.
     *
     * @param   Function    cb      A callback function to execute after the
     *                              bars are built
     * @return  void
     * @private
     */
    function buildBars(cb){
        var obj = S.getCurrent();

        // build the title, if present
        U.get('sb-title-inner').innerHTML = obj.title || '';

        // build the nav
        var c, n, pl, pa, p;
        if(S.options.displayNav){
            c = true;
            // next & previous links
            var len = S.gallery.length;
            if(len > 1){
                if(S.options.continuous)
                    n = p = true; // show both
                else{
                    n = (len - 1) > S.current; // not last in gallery, show next
                    p = S.current > 0; // not first in gallery, show previous
                }
            }
            // in a slideshow?
            if(S.options.slideshowDelay > 0 && S.hasNext()){
                pa = !S.isPaused();
                pl = !pa;
            }
        }else{
            c = n = pl = pa = p = false;
        }
        toggleNav('close', c);
        toggleNav('next', n);
        toggleNav('play', pl);
        toggleNav('pause', pa);
        toggleNav('previous', p);

        // build the counter
        var counter = '';
        if(S.options.displayCounter && S.gallery.length > 1){
            var len = S.gallery.length;

            if(S.options.counterType == 'skip'){
                // limit the counter?
                var i = 0,
                    end = len,
                    limit = parseInt(S.options.counterLimit) || 0;

                if(limit < len && limit > 2){ // support large galleries
                    var h = Math.floor(limit / 2);
                    i = S.current - h;
                    if(i < 0) i += len;
                    end = S.current + (limit - h);
                    if(end > len) end -= len;
                }
                while(i != end){
                    if(i == len) i = 0;
                    counter += '<a onclick="Shadowbox.change(' + i + ');"'
                    if(i == S.current) counter += ' class="sb-counter-current"';
//Wizzud : counter correction to not start at zero!...
//                    counter += '>' + (i++) + '</a>';
                    counter += '>' + (++i) + '</a>';
                }
            }else
                var counter = (S.current + 1) + ' ' + S.lang.of + ' ' + len;
        }

        U.get('sb-counter').innerHTML = counter;

        cb();
    }

    /**
     * Hides the title and info bars.
     *
     * @param   Boolean     anim    True to animate the transition
     * @param   Function    cb      A callback function to execute after the
     *                              animation completes
     * @return  void
     * @private
     */
    function hideBars(anim, cb){
        var sw = U.get('sb-wrapper'),
            st = U.get('sb-title'),
            si = U.get('sb-info'),
            ti = U.get('sb-title-inner'),
            ii = U.get('sb-info-inner'),
            t = parseInt(S.lib.getStyle(ti, 'height')) || 0,
            b = parseInt(S.lib.getStyle(ii, 'height')) || 0;

        var fn = function(){
            // hide bars here in case of overflow, build after hidden
            ti.style.visibility = ii.style.visibility = 'hidden';
            buildBars(cb);
        }

//Wizzud...
				if(!_closeTop.hide){
					_closeTop.hide = t;
					_closeTop.show = t - parseInt(S.lib.getStyle(U.get('sb-nav-close'), 'height'), 10);
				}

        if(anim){
//Wizzud...
						U.animate(U.get('sb-nav-close'), 'top', _closeTop.hide, 0.35);
            U.animate(st, 'height', 0, 0.35);
            U.animate(si, 'height', 0, 0.35);
            U.animate(sw, 'paddingTop', t, 0.35);
            U.animate(sw, 'paddingBottom', b, 0.35, fn);
        }else{
//Wizzud...
						U.get('sb-nav-close').style.top = _closeTop.hide+'px';
            st.style.height = si.style.height = '0px';
            sw.style.paddingTop = t + 'px';
            sw.style.paddingBottom = b + 'px';
            fn();
        }
    }

    /**
     * Shows the title and info bars.
     *
     * @param   Function    cb      A callback function to execute after the
     *                              animation completes
     * @return  void
     * @private
     */
    function showBars(cb){
        var sw = U.get('sb-wrapper'),
            st = U.get('sb-title'),
            si = U.get('sb-info'),
            ti = U.get('sb-title-inner'),
            ii = U.get('sb-info-inner'),
            t = parseInt(S.lib.getStyle(ti, 'height')) || 0,
            b = parseInt(S.lib.getStyle(ii, 'height')) || 0;

        // clear visibility before animating into view
        ti.style.visibility = ii.style.visibility = '';

//Wizzud...
				U.animate(U.get('sb-nav-close'), 'top', _closeTop.show, 0.35);

        // show title?
        if(ti.innerHTML != ''){
            U.animate(st, 'height', t, 0.35);
            U.animate(sw, 'paddingTop', 0, 0.35);
        }
        U.animate(si, 'height', b, 0.35);
        U.animate(sw, 'paddingBottom', 0, 0.35, cb);
    }

    /**
     * Adjusts the height of #sb-body and centers #sb-wrapper vertically
     * in the viewport.
     *
     * @param   Number      height      The height to use for #sb-body
     * @param   Number      top         The top to use for #sb-wrapper
     * @param   Boolean     anim        True to animate the transition
     * @param   Function    cb          A callback to use when the animation
     *                                  completes
     * @return  void
     * @private
     */
    function adjustHeight(height, top, anim, cb){
        var sb = U.get('sb-body'),
            s = U.get('sb-wrapper'),
            h = parseInt(height),
            t = parseInt(top);

        if(anim){
            U.animate(sb, 'height', h, S.options.resizeDuration);
            U.animate(s, 'top', t, S.options.resizeDuration, cb);
        }else{
            sb.style.height = h + 'px';
            s.style.top = t + 'px';
            if(cb) cb();
        }
    }

    /**
     * Adjusts the width and left of #sb-wrapper.
     *
     * @param   Number      width       The width to use for #sb-wrapper
     * @param   Number      left        The left to use for #sb-wrapper
     * @param   Boolean     anim        True to animate the transition
     * @param   Function    cb          A callback to use when the animation
     *                                  completes
     * @return  void
     * @private
     */
    function adjustWidth(width, left, anim, cb){
        var s = U.get('sb-wrapper'),
            w = parseInt(width),
            l = parseInt(left);

        if(anim){
            U.animate(s, 'width', w, S.options.resizeDuration);
            U.animate(s, 'left', l, S.options.resizeDuration, cb);
        }else{
            s.style.width = w + 'px';
            s.style.left = l + 'px';
            if(cb) cb();
        }
    }

    /**
     * Calculates the dimensions for Shadowbox, taking into account the borders
     * and surrounding elements of #sb-body.
     *
     * @param   Number      height      The content height
     * @param   Number      width       The content width
     * @param   Boolean     resizable   True if the content is able to be
     *                                  resized. Defaults to false
     * @return  Object                  The new dimensions object
     * @private
     */
    function setDimensions(height, width, resizable){
//Wizzud: missing comma...
//        var sbi = U.get('sb-body-inner')
        var sbi = U.get('sb-body-inner'),
            sw = U.get('sb-wrapper'),
            so = U.get('sb-overlay'),
            tb = sw.offsetHeight - sbi.offsetHeight,
            lr = sw.offsetWidth - sbi.offsetWidth,
            max_h = so.offsetHeight, // measure overlay to get viewport size for IE6
            max_w = so.offsetWidth;

        S.setDimensions(height, width, max_h, max_w, tb, lr, resizable);

        return S.dimensions;
    }

    // expose
    S.skin = K;

})();
