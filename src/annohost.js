/* 
 * Copyright (c) 2013 Mark Salsbery
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/*** @module openseadragon-annohost */

/**
 * The OpenSeadragon namespace
 * @external OpenSeadragon
 * @see {@link http://openseadragon.github.io/docs/OpenSeadragon.html OpenSeadragon Documentation}
 */

/**
 * @external "OpenSeadragon.Viewer"
 * @see {@link http://openseadragon.github.io/docs/OpenSeadragon.Viewer.html OpenSeadragon.Viewer Documentation}
 */

/**
 * @external "OpenSeadragon.EventSource"
 * @see {@link http://openseadragon.github.io/docs/OpenSeadragon.EventHandler.html OpenSeadragon.EventSource Documentation}
 */

/**
 * @external "OpenSeadragon.Point"
 * @see {@link http://openseadragon.github.io/docs/OpenSeadragon.Point.html OpenSeadragon.Point Documentation}
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @external "OpenSeadragon.Rect"
 * @see {@link http://openseadragon.github.io/docs/OpenSeadragon.Rect.html OpenSeadragon.Rect Documentation}
 * @property {Number} x
 * @property {Number} y
 * @property {Number} width
 * @property {Number} height
 */

/**
 * @external "OpenSeadragon.ImagingHelper"
 * @see {@link http://msalsbery.github.io/openseadragonimaginghelper/docs/index.html OpenSeadragon.ImagingHelper Documentation}
 */

/**
 * @namespace Annotations
 * @memberof external:OpenSeadragon
 */
(function(OSD, $, undefined) {

    if (!OSD.version || OSD.version.major < 1) {
        throw new Error('OpenSeadragon.Annotations requires OpenSeadragon version 1.0.0+');
    }

    /**
     * Event handler method signature used by all OpenSeadragon events.
     *
     * @callback EventHandler
     * @memberof external:OpenSeadragon
     * @param {Object} event - See individual events for event properties passed.
     */

    /**
     *
     * @class external:OpenSeadragon.Viewer
     * @extends external:"OpenSeadragon.Viewer"
     *
     **/

    /**
     * Creates a new AnnoHost attached to the viewer.
     *
     * @method activateAnnoHost
     * @memberof external:OpenSeadragon.Viewer#
     * @param {Object} options
     * @param {external:OpenSeadragon.EventHandler} [options.onImageViewChanged] - image-view-changed handler method.
     * @returns {external:OpenSeadragon.Annotations.AnnoHost}
     *
     **/
    OSD.Viewer.prototype.activateAnnoHost = function(options) {
        if (!this.annoHost) {
            options = options || {};
            options.viewer = this;
            this.annoHost = new $.AnnoHost(options);
        }
        return this.annoHost;
    };

    /**
     * Creates a new AnnoHost attached to the viewer instance passed in the options parameter.
     *
     * @class AnnoHost
     * @classdesc Provides a framework for annotating OpenSeadragon images.
     * @memberof external:OpenSeadragon.Annotations
     * @extends external:"OpenSeadragon.ImagingHelper"
     * @param {Object} options
     * @param {external:"OpenSeadragon.Viewer"} options.viewer - Required! Reference to OpenSeadragon viewer to attach to.
     * @param {external:OpenSeadragon.EventHandler} [options.onImageViewChanged] - {@link external:OpenSeadragon.ImagingHelper.event:image-view-changed} handler method.
     *
     **/
    $.AnnoHost = function(options) {
        options = options || {};

        if (typeof(OSD.Viewer.prototype.activateImagingHelper) !== 'function') {
            throw new Error('OpenSeadragon.Annotations.AnnoHost requires the OpenSeadragonImagingHelper plugin.');
        }
        if (!OSD.ImagingHelper.version || OSD.ImagingHelper.version.major < 1) {
            throw new Error('OpenSeadragon.Annotations.AnnoHost requires OpenSeadragonImagingHelper plugin version 1.0.0+');
        }
        if (typeof(OSD.Viewer.prototype.addViewerInputHook) !== 'function') {
            throw new Error('OpenSeadragon.Annotations.AnnoHost requires the OpenSeadragonViewerInputHook plugin.');
        }
        if (!OSD.ViewerInputHook.version || OSD.ViewerInputHook.version.major < 1) {
            throw new Error('OpenSeadragon.Annotations.AnnoHost requires OpenSeadragonViewerInputHook plugin version 1.0.0+');
        }
        if (!options.viewer) {
            throw new Error('A viewer must be specified.');
        }
        if (options.viewer.annoHost) {
            throw new Error('Viewer already has an AnnoHost.');
        }

        // Call base class constructor
        OSD.ImagingHelper.call(this, options);

        // Add this object to the Viewer        
        this._viewer.annoHost = this;

        // Private
        this._osdCanvas = null;
        this._annotationGrappleWidth = 8 | 0;

        // Wire up event handlers
        this.addHandler('image-view-changed', OSD.delegate(this, onImageViewChanged));
        this._viewerInputHook = this._viewer.addViewerInputHook({hooks: [
            {tracker: 'viewer', handler: 'dragHandler',   hookHandler: OSD.delegate(this, onHookViewerDrag)},
            {tracker: 'viewer', handler: 'enterHandler',  hookHandler: OSD.delegate(this, onHookViewerEnter)},
            {tracker: 'viewer', handler: 'moveHandler',   hookHandler: OSD.delegate(this, onHookViewerMove)},
            {tracker: 'viewer', handler: 'exitHandler',   hookHandler: OSD.delegate(this, onHookViewerExit)},
            {tracker: 'viewer', handler: 'scrollHandler', hookHandler: OSD.delegate(this, onHookViewerScroll)},
            {tracker: 'viewer', handler: 'clickHandler',  hookHandler: OSD.delegate(this, onHookViewerClick)}
        ]});
        this._viewer.addHandler('open', OSD.delegate(this, onOpen));
        this._viewer.addHandler('close', OSD.delegate(this, onClose));
        this._viewer.addHandler('pre-full-page', OSD.delegate(this, onPreFullPage));
        this._viewer.addHandler('full-page', OSD.delegate(this, onFullPage));
        this._viewer.addHandler('pre-full-screen', OSD.delegate(this, onPreFullScreen));
        this._viewer.addHandler('full-screen', OSD.delegate(this, onFullScreen));

    };

    /**
     * AnnoHost version.
     * @member {Object} external:OpenSeadragon.Annotations.AnnoHost.version
     * @property {String} versionStr - The version number as a string ('major.minor.revision').
     * @property {Number} major - The major version number.
     * @property {Number} minor - The minor version number.
     * @property {Number} revision - The revision number.
     */
    /* jshint ignore:start */
    $.AnnoHost.version = {
        versionStr: '<%= annohostVersion.versionStr %>',
        major: <%= annohostVersion.major %>,
        minor: <%= annohostVersion.minor %>,
        revision: <%= annohostVersion.revision %>
    };
    /* jshint ignore:end */


    // Inherit OpenSeadragon.ImagingHelper
    $.AnnoHost.prototype = Object.create(OSD.ImagingHelper.prototype);
    Object.defineProperty($.AnnoHost.prototype, 'constructor', {enumerable: false, value: $.AnnoHost});


    // Properties
    Object.defineProperties($.AnnoHost.prototype,
    {
        /**
         * Gets the image's native width in pixels.
         * @member {Number} dataWidth
         * @memberof external:OpenSeadragon.Annotations.AnnoHost#
         *
         **/
        dataWidth: {
            get: function () {
                return this.imgWidth;
            },
            enumerable: true,
            configurable: true
        },
        /**
         * Gets the image's native height in pixels.
         * @member {Number} dataHeight
         * @memberof external:OpenSeadragon.Annotations.AnnoHost#
         *
         **/
        dataHeight: {
            get: function () {
                return this.imgHeight;
            },
            enumerable: true,
            configurable: true
        },
        /**
         * Gets the dimensions of annotation UI grapples in pixels.
         * @member {Number} annotationGrappleWidth
         * @memberof external:OpenSeadragon.Annotations.AnnoHost#
         *
         **/
        annotationGrappleWidth: {
            get: function () {
                return this._annotationGrappleWidth;
            },
            enumerable: true,
            configurable: true
        }
    });


    // Methods
    OSD.extend($.AnnoHost.prototype,
    /** @lends external:OpenSeadragon.Annotations.AnnoHost.prototype */
    {
        /**
         * TEST.
         * @method
         * @returns {number}
         *
         **/
        testMethod: function () {
            return 0;
        },

        /**
         * Called by Annotation objects when editing starts.
         * @method
         * @param {external:OpenSeadragon.Annotations.Annotation} annotation
         *
         **/
        notifyAnnotationTrackingEditStarted: function (annotation) {
            annotation = annotation || null;
        },


    });


    /*
     * @private
     * @method
     *
     **/
    function onOpen() {
        //this._haveImage = true;
        this._osdCanvas = this._viewer.canvas;
    }

    /*
     * @private
     * @method
     *
     **/
    function onClose() {
        //this._haveImage = false;
        this._osdCanvas = null;
    }

    /*
     * @private
     * @method
     *
     **/
    function onImageViewChanged() {
        // Raised whenever the viewer's zoom or pan changes and the ImagingHelper's properties have been updated.
        // event.viewportWidth == width of viewer viewport in logical coordinates relative to image native size
        // event.viewportHeight == height of viewer viewport in logical coordinates relative to image native size
        // event.viewportOrigin == OpenSeadragon.Point, top-left of the viewer viewport in logical coordinates relative to image
        // event.viewportCenter == OpenSeadragon.Point, center of the viewer viewport in logical coordinates relative to image
        // event.zoomFactor == current zoom factor
    }

    /*
     * @private
     * @method
     *
     **/
    function onPreFullPage(event) {
        // set event.preventDefaultAction = true to prevent viewer's default action
        if (event.fullPage) {
            // Going to full-page mode
        }
    }

    /*
     * @private
     * @method
     *
     **/
    function onFullPage(event) {
        if (!event.fullPage) {
            // Exited full-page mode
        }
    }

    /*
     * @private
     * @method
     *
     **/
    function onPreFullScreen(event) {
        // set event.preventDefaultAction = true to prevent viewer's default action
        if (event.fullScreen) {
            // Going to full-screen mode
        }
    }

    /*
     * @private
     * @method
     *
     **/
    function onFullScreen(event) {
        if (!event.fullScreen) {
            // Exited full-screen mode
        }
    }

    /*
     * @private
     * @method
     *
     **/
    function onHookViewerDrag() {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
    }

    /*
     * @private
     * @method
     *
     **/
    function onHookViewerEnter() {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
    }

    /*
     * @private
     * @method
     *
     **/
    function onHookViewerMove() {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
    }

    /*
     * @private
     * @method
     *
     **/
    function onHookViewerExit() {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
    }

    /*
     * @private
     * @method
     *
     **/
    function onHookViewerScroll() {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
    }

    /*
     * @private
     * @method
     *
     **/
    function onHookViewerClick() {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
    }


}(OpenSeadragon, OpenSeadragon.Annotations = OpenSeadragon.Annotations || {}));
