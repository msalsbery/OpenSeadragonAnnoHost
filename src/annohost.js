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
 * @external OpenSeadragon
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.html OpenSeadragon.Viewer Documentation}
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
 * @see {@link http://openseadragon.github.io/docs/symbols/OpenSeadragon.Point.html OpenSeadragon.EventSource Documentation}
 */

/**
 * @namespace OpenSeadragon
 * @extends external:OpenSeadragon
 */
(function($) {

    /**
     * Event handler method signature used by all OpenSeadragon events.
     *
     * @callback eventHandler
     * @memberof OpenSeadragon
     * @param {object} event - See individual events for event properties passed.
     */

    /**
     *
     * @class OpenSeadragon.Viewer
     * @memberof OpenSeadragon
     * @extends external:"OpenSeadragon.Viewer"
     *
     **/

    /**
     * Creates a new AnnoHost attached to the viewer.
     *
     * @memberof OpenSeadragon.Viewer
     * @method OpenSeadragon.Viewer#activateAnnoHost
     * @param {Object} options
     * @param {OpenSeadragon.eventHandler} [options.viewChangedHandler] - {@link OpenSeadragon.AnnoHost.event:image-view-changed} handler method.
     *
     **/
    $.Viewer.prototype.activateAnnoHost = function(options) {
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
     * @classdesc Provides imaging helper methods and properties for the OpenSeadragon viewer.
     * @memberof OpenSeadragon
     * @extends external:"OpenSeadragon.EventSource"
     * @param {Object} options
     * @param {external:"OpenSeadragon.Viewer"} options.viewer - Required! Reference to OpenSeadragon viewer to attach to.
     * @param {OpenSeadragon.eventHandler} [options.viewChangedHandler] - {@link OpenSeadragon.AnnoHost.event:image-view-changed} handler method.
     *
     **/
    $.AnnoHost = function(options) {
        options = options || {};

        if (typeof($.Viewer.prototype.activateImagingHelper) !== 'function') {
            throw new Error('Requires the OpenSeadragonImagingHelper plugin.');
        }
        if (typeof($.Viewer.prototype.addViewerInputHook) !== 'function') {
            throw new Error('Requires the OpenSeadragonViewerInputHook plugin.');
        }
        if (!options.viewer) {
            throw new Error('A viewer must be specified.');
        }
        if (options.viewer.annoHost) {
            throw new Error('Viewer already has an AnnoHost.');
        }

        options.viewer.annoHost = this;

        /**
         * A reference to the options passed at creation.
         * @member {object} options
         * @memberof OpenSeadragon.AnnoHost#
         * @property {external:"OpenSeadragon.Viewer"} viewer - Reference to OpenSeadragon viewer this AnnoHost is attached to.
         * @property {OpenSeadragon.eventHandler} [viewChangedHandler] - {@link OpenSeadragon.AnnoHost.event:image-view-changed} handler method.
         */
        this.options = options;

        // TODO Scope these private

        this._viewer = options.viewer;
        this._haveImage = false;
        this._osdCanvas = null;

        $.EventSource.call(this);
        
        //if (options.viewChangedHandler) {
        //    this.addHandler('image-view-changed', options.viewChangedHandler);
        //}

        this._viewer.addHandler("open", $.delegate(this, this.onOpen));
        this._viewer.addHandler("close", $.delegate(this, this.onClose));
        this._viewer.addHandler("fullpage", $.delegate(this, this.onFullPage));
    };

    $.extend($.AnnoHost.prototype, $.EventSource.prototype,
    /** @lends OpenSeadragon.AnnoHost.prototype */
    {
        /***
         * Raised whenever the viewer's zoom or pan changes and the AnnoHost's properties have been updated.
         *
         * @event image-view-changed
         * @memberof OpenSeadragon.AnnoHost
         * @type {object}
         * @property {OpenSeadragon.AnnoHost} eventSource - A reference to the AnnoHost which raised the event.
         * @property {number} viewportWidth - Width of viewport in logical coordinates.
         * @property {number} viewportHeight - Height of viewport in logical coordinates.
         * @property {external:"OpenSeadragon.Point"} viewportCenter - Center of viewport in logical coordinates.
         */

        onOpen: function() {
            this._haveImage = true;
            this._osdCanvas = this._viewer.canvas;
        },

        onClose: function() {
            this._haveImage = false;
        },

        onFullPage: function() {
        }

    });

}(OpenSeadragon));
