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


/**
 * The OpenSeadragon namespace
 * @external OpenSeadragon
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.html OpenSeadragon Documentation}
 */

/**
 * @external "OpenSeadragon.Viewer"
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.Viewer.html OpenSeadragon.Viewer Documentation}
 */

/**
 * @external "OpenSeadragon.EventSource"
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.EventHandler.html OpenSeadragon.EventSource Documentation}
 */

/**
 * @external "OpenSeadragon.Point"
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.Point.html OpenSeadragon.Point Documentation}
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @external "OpenSeadragon.Rect"
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.Rect.html OpenSeadragon.Rect Documentation}
 * @property {Number} x
 * @property {Number} y
 * @property {Number} width
 * @property {Number} height
 */

/**
 * @namespace Annotations
 * @memberof external:OpenSeadragon
 */
(function(OSD, $, undefined) {

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
     * @param {external:OpenSeadragon.EventHandler} [options.onImageViewChanged] - {@link external:OpenSeadragon.Annotations.AnnoHost.event:image-view-changed} handler method.
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
     * @extends external:"OpenSeadragon.EventSource"
     * @param {Object} options
     * @param {external:"OpenSeadragon.Viewer"} options.viewer - Required! Reference to OpenSeadragon viewer to attach to.
     * @param {external:OpenSeadragon.EventHandler} [options.onImageViewChanged] - {@link external:OpenSeadragon.Annotations.AnnoHost.event:image-view-changed} handler method.
     *
     **/
    $.AnnoHost = function(options) {
        options = options || {};

        if (typeof(OSD.Viewer.prototype.activateImagingHelper) !== 'function') {
            throw new Error('Requires the OpenSeadragonImagingHelper plugin.');
        }
        if (typeof(OSD.Viewer.prototype.addViewerInputHook) !== 'function') {
            throw new Error('Requires the OpenSeadragonViewerInputHook plugin.');
        }
        if (!options.viewer) {
            throw new Error('A viewer must be specified.');
        }
        if (options.viewer.annoHost) {
            throw new Error('Viewer already has an AnnoHost.');
        }

        OSD.EventSource.call(this);
        
        this.viewer = options.viewer;
        this.viewer.annoHost = this;

        /**
         * A reference to the options passed at creation.
         * @member {object} options
         * @memberof external:OpenSeadragon.Annotations.AnnoHost#
         * @property {external:"OpenSeadragon.Viewer"} viewer - Reference to OpenSeadragon viewer this AnnoHost is attached to.
         * @property {external:OpenSeadragon.EventHandler} [onImageViewChanged] - {@link external:OpenSeadragon.Annotations.AnnoHost.event:image-view-changed} handler method.
         */
        this.options = options;

        // TODO Scope these private

        this._haveImage = false;
        this._osdCanvas = null;
        this._imagingHelper = this.viewer.imagingHelper ? this.viewer.imagingHelper : this.viewer.activateImagingHelper({});

        this._imagingHelper.addHandler('image-view-changed', OSD.delegate(this, this.onImageViewChanged));
        this._viewerInputHook = this.viewer.addViewerInputHook({hooks: [
            {tracker: 'viewer', handler: 'dragHandler',   hookHandler: OSD.delegate(this, this.onHookViewerDrag)},
            {tracker: 'viewer', handler: 'enterHandler',  hookHandler: OSD.delegate(this, this.onHookViewerEnter)},
            {tracker: 'viewer', handler: 'moveHandler',   hookHandler: OSD.delegate(this, this.onHookViewerMove)},
            {tracker: 'viewer', handler: 'exitHandler',   hookHandler: OSD.delegate(this, this.onHookViewerExit)},
            {tracker: 'viewer', handler: 'scrollHandler', hookHandler: OSD.delegate(this, this.onHookViewerScroll)},
            {tracker: 'viewer', handler: 'clickHandler',  hookHandler: OSD.delegate(this, this.onHookViewerClick)}
        ]});
        this.viewer.addHandler("open", OSD.delegate(this, this.onOpen));
        this.viewer.addHandler("close", OSD.delegate(this, this.onClose));
        this.viewer.addHandler("pre-full-page", OSD.delegate(this, this.onPreFullPage));
        this.viewer.addHandler("full-page", OSD.delegate(this, this.onFullPage));

    };

    OSD.extend($.AnnoHost.prototype, OSD.EventSource.prototype,
    /** @lends external:OpenSeadragon.Annotations.AnnoHost.prototype */
    {
        /**
         * Raised whenever the viewer's zoom or pan changes and the ImagingHelper's properties have been updated.
         *
         * @event image-view-changed
         * @memberof external:OpenSeadragon.Annotations.AnnoHost
         * @type {object}
         * @property {external:OpenSeadragon.Annotations.AnnoHost} eventSource - A reference to the ImagingHelper which raised the event.
         * @property {number} viewportWidth - Width of viewport in logical coordinates.
         * @property {number} viewportHeight - Height of viewport in logical coordinates.
         * @property {external:"OpenSeadragon.Point"} viewportCenter - Center of viewport in logical coordinates.
         * @property {Object} [userData=null] - Arbitrary subscriber-defined object.
         */

        /**
         * @method
         *
         **/
        onOpen: function() {
            this._haveImage = true;
            this._osdCanvas = this.viewer.canvas;
        },

        onClose: function() {
            this._haveImage = false;
            this._osdCanvas = null;
        },

        onPreFullPage: function(event) {
            // set event.preventDefaultAction = true to prevent viewer's default action
            if (event.fullPage) {
                // Going to full-page mode
            }
        },

        onFullPage: function(event) {
            if (!event.fullPage) {
                // Exited full-page mode
            }
        },

        onImageViewChanged: function () {
            // event.viewportWidth == width of viewer viewport in logical coordinates relative to image native size
            // event.viewportHeight == height of viewer viewport in logical coordinates relative to image native size
            // event.viewportOrigin == OpenSeadragon.Point, top-left of the viewer viewport in logical coordinates relative to image
            // event.viewportCenter == OpenSeadragon.Point, center of the viewer viewport in logical coordinates relative to image
            // event.zoomFactor == current zoom factor
        },

        onHookViewerDrag: function () {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
        },

        onHookViewerEnter: function () {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
        },

        onHookViewerMove: function () {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
        },

        onHookViewerExit: function () {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
        },

        onHookViewerScroll: function () {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
        },

        onHookViewerClick: function () {
            // set event.stopHandlers = true to prevent any more handlers in the chain from being called
            // set event.stopBubbling = true to prevent the original event from bubbling
            // set event.preventDefaultAction = true to prevent viewer's default action
        }

    });

}(OpenSeadragon, OpenSeadragon.Annotations = OpenSeadragon.Annotations || {}));
