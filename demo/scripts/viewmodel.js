(function() {

    function BaseClass()
    {
        //var _x = 321;
        this._x = 321;

        this._map = {};

//        Object.defineProperties(this, {
//            baseDataProperty: {
//                value: 123,
//                writable: true,
//                enumerable: true,
//                configurable: true
//            },
//            baseAccessorProperty: {
//                get: function () {
//                    return _x;
//                },
//                set: function (x) {
//                    _x = x;
//                },
//                enumerable: true,
//                configurable: true
//            }
//        });
    };

    Object.defineProperties(BaseClass.prototype, {
        baseDataProperty: {
            value: 123,
            writable: true,
            enumerable: true,
            configurable: true
        },
        baseAccessorProperty: {
            get: function () {
                return this._x;
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        }
    });

    BaseClass.prototype.parseXML = function( key, value )
    {
        OpenSeadragon.console.log('BaseClass::parseXML()');
        this._map[key] = value;
    }

    function ChildClass()
    {
        BaseClass.call(this);

        this.baseAccessorProperty = 55555;
        this.bValue = 1;

//        // data descriptor
//        Object.defineProperty(this, 'childDataProperty', {value : 37,
//                                       writable : true,
//                                       enumerable : true,
//                                       configurable : true});

//        // accessor descriptor
//        var bValue;
//        Object.defineProperty(this, 'childAccessorProperty', {get : function(){ return bValue; },
//                                       set : function(newValue){ bValue = newValue; },
//                                       enumerable : true,
//                                       configurable : true});

    }

    ChildClass.prototype = Object.create(BaseClass.prototype);
    Object.defineProperty(ChildClass.prototype, 'constructor', {enumerable: false, value: ChildClass});

    Object.defineProperties(ChildClass.prototype, {
        childDataProperty: {
            value: 37,
            writable: true,
            enumerable: false,
            configurable: true
        },
        childAccessorProperty: {
            get: function () {
                return this.bValue;
            },
            set: function (x) {
                this.bValue = x;
            },
            enumerable: false,
            configurable: true
        }
    });

    ChildClass.prototype.parseXML = function( key, value, otherData )
    {
        OpenSeadragon.console.log('ChildClass()::parseXML()');
        BaseClass.prototype.parseXML.call(this, key, value);
    }

    var x = new BaseClass();
    var a = new ChildClass();
    var b = new ChildClass();
    OpenSeadragon.console.log('*** base ***');
    //for (var i in x) {    
    //  OpenSeadragon.console.log(i);
    //}
    OpenSeadragon.console.log('*** child ***');
    //for (var i in a) {    
    //  OpenSeadragon.console.log(i);
    //}
//*************************************************************************************************

    var appTitle = 'OpenSeadragon Annotations';
    var appDesc = 'OpenSeadragonAnnoHost Plugin';

    $(window).resize(onWindowResize);
    $(window).resize();

    var tileSource = new OpenSeadragon.LegacyTileSource( [{
        url: 'data/dog_radiograph_2.jpg',
        width: 1909,
        height: 1331
    }] );

    var tileSources = [
        new OpenSeadragon.LegacyTileSource( [{
            url: 'data/dog_radiograph_2.jpg',
            width: 1909,
            height: 1331
        }] ),
        'data/testpattern.dzi',
        'data/tall.dzi',
        'data/wide.dzi'
    ];

    var _navExpanderIsCollapsed = true,
        _$navExpander = $('.navigatorExpander'),
        _$navExpanderHeaderContainer = $('.expanderHeaderContainer'),
        _$navExpanderHeader = $(_$navExpanderHeaderContainer.children()[0]),
        _$navExpanderContentContainer = $('.expanderContentContainer'),
        _$navExpanderContent = $(_$navExpanderContentContainer.children()[0]),
        _navExpanderExpandedOpacity = 1.0,
        _navExpanderCollapsedOpacity = 0.40,
        _navExpanderWidth = 190,
        _navExpanderHeight = 220,
        _navExpanderCollapsedWidth = _$navExpanderHeader.outerWidth(),
        _navExpanderCollapsedHeight = _$navExpanderHeaderContainer.outerHeight();

    var viewer = OpenSeadragon({
                    //debugMode: true,
                    //showReferenceStrip: true,
                    id: 'viewerDiv1',
                    prefixUrl: 'content/images/openseadragon/',
                    useCanvas: true,
                    showNavigationControl: true,
                    navigationControlAnchor: OpenSeadragon.ControlAnchor.BOTTOM_LEFT,
                    showSequenceControl: true,
                    sequenceControlAnchor: OpenSeadragon.ControlAnchor.BOTTOM_LEFT,
                    showNavigator: true,
                    navigatorId: 'navigatorDiv1',
                    //navigatorPosition: 'ABSOLUTE', //'TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT', 'ABSOLUTE'
                    //navigatorSizeRatio: 0.2,
                    //navigatorMaintainSizeRatio: true,
                    //navigatorTop: 10,
                    //navigatorLeft: 10,
                    //navigatorHeight: 300,
                    //navigatorWidth: 300,
                    navigatorAutoResize: false,
                    visibilityRatio: 0.1,
                    minZoomLevel: 0.001,
                    maxZoomLevel: 10,
                    zoomPerClick: 1.4,
                    autoResize: false, // If false, we have to handle resizing of the viewer
                    tileSources: tileSources
                }),
        annoHost = viewer.activateAnnoHost({onImageViewChanged: onImageViewChanged}),
        //testTracker = new OpenSeadragon.MouseTracker({element: viewer.container}).setTracking(true),
        viewerInputHook = viewer.addViewerInputHook({hooks: [
            {tracker: 'viewer', handler: 'scrollHandler', hookHandler: onHookOsdViewerScroll},
            {tracker: 'viewer', handler: 'clickHandler', hookHandler: onHookOsdViewerClick}
        ]}),
        $osdCanvas = null;

    viewer.addHandler('open', function (event) {
        $osdCanvas = $(viewer.canvas);
        setMinMaxZoomForImage();
        outputVM.haveImage(true);
        $osdCanvas.on('mouseenter.osdimaginghelper', onOsdCanvasMouseEnter);
        $osdCanvas.on('mousemove.osdimaginghelper', onOsdCanvasMouseMove);
        $osdCanvas.on('mouseleave.osdimaginghelper', onOsdCanvasMouseLeave);
        updateImageVM();
        updateImgViewerViewVM();

        if (viewer.navigator && viewer.navigator.element) {
            (function( style, borderWidth ){
                style.margin        = '0px';
                style.padding       = '0px';
                style.border        = '';
                style.background    = '#ffffff'; //#000
                style.opacity       = 1.0;       //0.8
                style.overflow      = 'visible';
            }( viewer.navigator.element.style));
        }

        _$navExpander.css( 'visibility', 'visible');
        if (_navExpanderIsCollapsed) {
            _navExpanderDoCollapse(false);
        }
        else {
            _navExpanderDoExpand(true);
        }
    });

    viewer.addHandler('close', function (event) {
        _$navExpander.css( 'visibility', 'hidden');
        outputVM.haveImage(false);
        $osdCanvas.off('mouseenter.osdimaginghelper', onOsdCanvasMouseEnter);
        $osdCanvas.off('mousemove.osdimaginghelper', onOsdCanvasMouseMove);
        $osdCanvas.off('mouseleave.osdimaginghelper', onOsdCanvasMouseLeave);
        $osdCanvas = null;
    });

    viewer.addHandler('navigator-scroll', function (event) {
        if (event.scroll > 0) {
            annoHost.zoomIn();
        }
        else {
            annoHost.zoomOut();
        }
    });

    viewer.addHandler('pre-full-page', function (event) {
        // set event.preventDefaultAction = true to prevent viewer's default action
        if (event.fullPage) {
            // Going to full-page mode...remove our bound DOM elements
            vm.outputVM(null);
        }
    });

    viewer.addHandler('full-page', function (event) {
        if (!event.fullPage) {
            // Exited full-page mode...restore our bound DOM elements
            vm.outputVM(outputVM);
        }
    });

    viewer.addHandler('pre-full-screen', function (event) {
        if (event.fullScreen) {
            // Going to full-screen mode...remove our bound DOM elements
            vm.outputVM(null);
        }
    });

    viewer.addHandler('full-screen', function (event) {
        if (!event.fullScreen) {
            // Exited full-screen mode...restore our bound DOM elements
            vm.outputVM(outputVM);
        }
    });

    function setMinMaxZoomForImage() {
        var minzoomX = 50.0 / annoHost.imgWidth;
        var minzoomY = 50.0 / annoHost.imgHeight;
        var minZoom = Math.min(minzoomX, minzoomY);
        var maxZoom = 10.0;
        annoHost.setMinZoom(minZoom);
        annoHost.setMaxZoom(maxZoom);
        annoHost.setZoomStepPercent(35);
    }

    function onImageViewChanged(event) {
        // event.viewportWidth == width of viewer viewport in logical coordinates relative to image native size
        // event.viewportHeight == height of viewer viewport in logical coordinates relative to image native size
        // event.viewportOrigin == OpenSeadragon.Point, top-left of the viewer viewport in logical coordinates relative to image
        // event.viewportCenter == OpenSeadragon.Point, center of the viewer viewport in logical coordinates relative to image
        // event.zoomFactor == current zoom factor
        updateImgViewerViewVM();
    }

    function onHookOsdViewerScroll(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
        var logPoint = annoHost.physicalToLogicalPoint(event.position);
        if (event.scroll > 0) {
            annoHost.zoomInAboutLogicalPoint(logPoint);
        }
        else {
            annoHost.zoomOutAboutLogicalPoint(logPoint);
        }
        event.stopBubbling = true;
        event.preventDefaultAction = true;
    }

    function onHookOsdViewerClick(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
        if (event.quick) {
            var logPoint = annoHost.physicalToLogicalPoint(event.position);
            if (event.shift) {
                annoHost.zoomOutAboutLogicalPoint(logPoint);
            }
            else {
                annoHost.zoomInAboutLogicalPoint(logPoint);
            }
        }
        event.stopBubbling = true;
        event.preventDefaultAction = true;
    }

    function onOsdCanvasMouseEnter(event) {
        outputVM.haveMouse(true);
    }

    function onOsdCanvasMouseMove(event) {
        var offset = $osdCanvas.offset();
        outputVM.mousePositionX(event.pageX);
        outputVM.mousePositionY(event.pageY);
        outputVM.elementOffsetX(offset.left);
        outputVM.elementOffsetY(offset.top);
        outputVM.mouseRelativeX(event.pageX - offset.left);
        outputVM.mouseRelativeY(event.pageY - offset.top);
    }

    function onOsdCanvasMouseLeave(event) {
        outputVM.haveMouse(false);
    }

    function updateImageVM() {
        if (outputVM.haveImage()) {
            outputVM.imgWidth(annoHost.imgWidth);
            outputVM.imgHeight(annoHost.imgHeight);
            outputVM.imgAspectRatio(annoHost.imgAspectRatio);
            outputVM.minZoom(annoHost.getMinZoom());
            outputVM.maxZoom(annoHost.getMaxZoom());
        }
    }

    function updateImgViewerViewVM() {
        if (outputVM.haveImage()) {
            outputVM.zoomFactor(annoHost.getZoomFactor());
            outputVM.viewportWidth(annoHost._viewportWidth);
            outputVM.viewportHeight(annoHost._viewportHeight);
            outputVM.viewportOriginX(annoHost._viewportOrigin.x);
            outputVM.viewportOriginY(annoHost._viewportOrigin.y);
            outputVM.viewportCenterX(annoHost._viewportCenter.x);
            outputVM.viewportCenterY(annoHost._viewportCenter.y);
        }
    }

    function onWindowResize() {
        var headerheight = $('.shell-header-wrapper').outerHeight(true);
        var footerheight = $('.shell-footer-wrapper').outerHeight(true);
        $('.shell-view-wrapper').css('top', headerheight);
        $('.shell-view-wrapper').css('bottom', footerheight);

        if (viewer && annoHost && !viewer.autoResize) {
            // We're handling viewer resizing ourselves. Let the ImagingHelper do it.
            annoHost.notifyResize();
        }
    }

    _$navExpanderHeaderContainer.on('click', null, function (event) {
        if (_navExpanderIsCollapsed) {
            _navExpanderExpand();
        }
        else {
            _navExpanderCollapse();
        }
    });

    function _navExpanderMakeResizable() {
        _$navExpander.resizable({
            disabled: false,
            handles: 'e, s, se',
            minWidth: 100,
            minHeight: 100,
            maxWidth: null,
            maxHeight: null,
            containment: '#theImageViewerContainer',
            resize: function (event, ui) {
                _navExpanderWidth = ui.size.width;
                _navExpanderHeight = ui.size.height;
                _navExpanderResizeContent();
            }
        });
    }

    function _navExpanderRemoveResizable() {
        _$navExpander.resizable('destroy');
    }

    function _navExpanderDoExpand(adjustresizable) {
        if (adjustresizable) {
            _navExpanderMakeResizable();
        }
        _$navExpander.width(_navExpanderWidth);
        _$navExpander.height(_navExpanderHeight);
        _$navExpanderContentContainer.show('fast', function () {
            _navExpanderResizeContent();
        });
        _$navExpander.css('opacity', _navExpanderExpandedOpacity);
    }

    function _navExpanderDoCollapse(adjustresizable) {
        _$navExpander.css('opacity', _navExpanderCollapsedOpacity);
        _$navExpanderContentContainer.hide('fast');
        _$navExpander.width(_navExpanderCollapsedWidth);
        _$navExpander.height(_navExpanderCollapsedHeight);
        _navExpanderResizeContent();
        if (adjustresizable) {
            _navExpanderRemoveResizable();
        }
    }

    function _navExpanderExpand() {
        if (_navExpanderIsCollapsed) {
            _navExpanderDoExpand(true);
            _navExpanderIsCollapsed = false;
        }
    }

    function _navExpanderCollapse() {
        if (!_navExpanderIsCollapsed) {
            _navExpanderDoCollapse(true);
            _navExpanderIsCollapsed = true;
        }
    }

    function _navExpanderResizeContent() {
        var wrapperwidth = _$navExpander.innerWidth();
        var wrapperheight = _$navExpander.innerHeight();
        var headerheight = _$navExpanderHeaderContainer ? _$navExpanderHeaderContainer.outerHeight(true) : 0;
        var newheight = wrapperheight - headerheight;
        _$navExpanderContentContainer.width(wrapperwidth);
        _$navExpanderContentContainer.height(newheight);
        _$navExpanderContent.width(wrapperwidth);
        _$navExpanderContent.height(newheight);
        viewer.navigator.updateSize();
        viewer.navigator.update(viewer.viewport);
    }

    var outputVM = {
        haveImage: ko.observable(false),
        haveMouse: ko.observable(false),
        imgWidth: ko.observable(0),
        imgHeight: ko.observable(0),
        imgAspectRatio: ko.observable(0),
        minZoom: ko.observable(0),
        maxZoom: ko.observable(0),
        zoomFactor: ko.observable(0),
        viewportWidth: ko.observable(0),
        viewportHeight: ko.observable(0),
        viewportOriginX: ko.observable(0),
        viewportOriginY: ko.observable(0),
        viewportCenterX: ko.observable(0),
        viewportCenterY: ko.observable(0),
        mousePositionX: ko.observable(0),
        mousePositionY: ko.observable(0),
        elementOffsetX: ko.observable(0),
        elementOffsetY: ko.observable(0),
        mouseRelativeX: ko.observable(0),
        mouseRelativeY: ko.observable(0)
    };

    var vm = {
        appTitle: ko.observable(appTitle),
        appDesc: ko.observable(appDesc),
        outputVM: ko.observable(outputVM),
    };

    ko.applyBindings(vm);

}());
