/*
 * Mootor Navigation
 */

(function (Moo) {
    // Module dependencies
    var Fx = Moo.Fx,
        Event = Moo.Event,
        listeners = Event.listeners,

        Panels;

    Panels = function (options) {

        var i,
            panel;

        this.el = options.el;
        this.panelClass = options.panel_class;
        this.navClass = options.nav_class;
        this.hiddenClass = options.hidden_class;
        this.panels = this.el.getElementsByClassName(this.panelClass);
        this.count = this.panels.length;
        this.x = 0;
        this.y = 0;
        this.current = 0;
        this.back = 0;
        this.height = Moo.view.clientH;
        this.width = Moo.view.clientW;
        this.thresholdX = this.width / 2;
        this.header = document.getElementById(options.header_id);

        if (this.header !== undefined) {
            this.nav(this.header);
            this.top = this.header.offsetHeight;
            this.height = Moo.view.clientH - this.top;
            this.el.style.marginTop = this.top + "px";
        }

        for (i = this.count; i--;) {
            panel = this.panels[i];
            panel.anchors = panel.getElementsByClassName(this.navClass);
            panel.height = panel.offsetHeight;
            hidden = panel.getElementsByClassName(this.hidden_class);
        }

        this.onDragMove = this.move;
        this.onDragEnd = this.check;
        Event.bind(this.el, "onDrag", this);

        if (document.body.style.overflow !== "hidden") {
            document.body.style.overflow = "hidden";
        }
        this.init();

    };

    Panels.prototype = {

        nav: function (el) {
            el.style.width = Moo.view.clientW + "px";
            el.anchors = el.getElementsByClassName(this.navClass);
        },

        init: function () {

            var onTouch,
                j,
                i,
                panels = this,
                panel;

            onTouch = function (e) {
                if (listeners.isDraggingX === false && listeners.isDraggingY === false) {
                    panels.set(this.rel);
                }
                return false;
            };

            // Reset styles and set anchor links
            for (i = this.count; i--;) {

                panel = this.panels[i];
                panel.style.width = this.width + "px";
                panel.style.overflow = 'hidden';

                if (i > 0) {
                    panel.style.left = ((this.width + 40) * 4) + "px";
                    panel.style.top = "0px";
                } else {
                    panel.style.left = "0px";
                }

                if (this.height > panel.height) {
                    panel.style.height = this.height + "px";
                    panel.height = this.height;
                }

                for (j = panel.anchors.length; j--;) {
                    if (panel.anchors[j].rel !== "") {
                        Event.bind(panel.anchors[j], "onTap", onTouch);
                    }
                }

            }

            if (this.header) {
                for (i = this.header.anchors.length; i--;) {
                    if (this.header.anchors[i].rel !== "") {
                        Event.bind(this.header.anchors[i], "onTap", onTouch);
                    }
                }
            }

        },

        /*      
         *      Move
         */
        move: function (e) {
                var duration = 0.5,
                element = this.el,
                panel =  this.panels[this.current],
                positions = {};

            // Update position
            if ((listeners.isDraggingX === true  && e.largeMove) || e.isLoading === true) {
                this.x = this.x + e.distanceX;
            } else if (listeners.isDraggingY === true) {
                this.y = this.y + e.distanceY;
                element = panel;
            }

            // Fast move
            if ((listeners.isDraggingX || listeners.isDraggingY) && !e.largeMove) {
                duration = 0;
            }

            // Bounce back
            if (e.bounceBack === true) {

                if (this.current > 0) {
                    this.x = (this.width + 40);
                    this.x = this.x > 0 ? -this.x : this.x;
                } else {
                    this.x = 0;
                }
                
                if (this.y !== 0) {
                    element = panel;
                    if (e.distanceOriginY < 0) {
                        this.y = 0;
                    } else {
                        if (panel.height >= this.height) {
                            this.y = -(panel.height - this.height);
                        }
                    }
                }

                e.bounceBack = false;
                duration = 0.5;

            }

            if (element === panel) {
                positions.x = 0;
                positions.y = this.y;
            } else {
                positions.x = this.x;
                positions.y = 0;
            }

            if (!e.callback) {
                Fx.translate(element, positions, {transitionDuration: duration});
            } else {
                Fx.translate(element, positions, {transitionDuration: duration, callback: e.callback});
            }

        },

        /*      
         *      Check move for change panels or bounce back
         */
        check: function (e) {

            var maxdist = this.thresholdX,
                is_momentum = false,
                bouncedist,
                tmpback,
                boostdist;

            // If position reach certain threshold, load new panel,
            // else, move panel back.

            if ((listeners.isDraggingX && this.y === 0) || listeners.isDraggingY) {

                // Velocity boost movement
                if (e.velocity.y !== 0) {
                    boostdist = e.velocity.y;
                    e.velocity.y = 0;
                    this.move({
                        distanceY: boostdist * 10,
                        largeMove: true,
                        isLoading: false,
                        callback: this.check(e)
                    });
                }

                if (e.distanceOriginX > maxdist && this.current < (this.count - 1)) {

                    // Move to left
                    if (this.current === 0) {
                        tmpback = this.back;
                        this.back = this.current;
                        this.current = tmpback;
                        is_momentum = true;
                    }

                } else if (e.distanceOriginX < (-maxdist) && this.current > 0) {

                    // Move to right
                    this.back = this.current;
                    this.current = 0;
                    is_momentum = true;

                }

                if (is_momentum === true) {
                    this.load();

                } else {
                    // Bounce back
                    bouncedist = this.height - this.panels[this.current].height;
                    if (this.y >= 0 || this.panels[this.current].offsetHeight -  this.height < -this.y) {
                        e.largeMove = true;
                        e.bounceBack = true;
                        this.move(e);
                    }

                }
            }

        },

        /*      
         *      Set current panel
         */
        set: function (pid) {

            var i;

            // Get panel by id and load it
            for (i = this.count; i--;) {
                if (this.panels[i].id === pid) {
                    if (this.current > 0) {
                        this.back = this.current;
                    }
                    this.current = i;
                    this.y = 0;
                    this.load();
                }
            }

        },

        /*      
         *      Load current panel
         */
        load: function () {

            var distance,
                panel,
                cb,
                back,
                hidden_tmp,
                hidden = [],
                i,
                clearTransform;

            panel = this.panels[this.current];
            back = this.panels[this.back];

            Fx.clean(panel)
            Fx.clean(back);

            Fx.hide([
                panel.hidden,
                back.hidden
            ]);

            cb = function () {
               Fx.show([
                    panel.hidden,
                    back.hidden
                ]);
            };

            // Calc movement

            if (this.current === 0) {
                // Left 
                distance = 0;
                if (this.back) {
                    back.style.left =  this.width + 40 + "px";
                }

            } else {
                // Right
                distance = this.width + 40;
                panel.style.left = distance + "px";

                if (this.back && this.back !== this.current) {
                    back.style.left = distance * 4 + "px";
                }

            }

            this.move({
                distanceX: -distance - this.x,
                largeMove: true,
                isLoading: true,
                callback: cb
            });


        }

    };

     /*
      *     Public
      */
    Moo.Nav = {

        panels: function (options) {
            if (typeof options !== "object") {
                options = {
                    header_id: "header",
                    panel_class: "panel",
                    nav_class: "nav"
                };
            }
            options.el = this.el;
            return new Panels(options);
        }

    };

    Moo.extend(Moo.Nav);

}($));
