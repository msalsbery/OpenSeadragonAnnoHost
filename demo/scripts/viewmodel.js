(function() {

//    function BaseClass()
//    {
//        var _x = 321;

//        this._map = {};

//        Object.defineProperties(this, {
//            baseDataProperty: {
//                value: 123,
//                writable: true,
//                enumerable: true,
//                configurable: true
//            },
//            baseAccessorProperty: {
//                set: function (x) {
//                    _x = x;
//                },
//                get: function () {
//                    return _x;
//                },
//                enumerable: true,
//                configurable: true
//            }
//        });
//    };

//    BaseClass.prototype.parseXML = function( key, value )
//    {
//        OpenSeadragon.console.log('BaseClass::parseXML()');
//        this._map[key] = value;
//    }

//    function ChildClass()
//    {
//        BaseClass.call(this);

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

//    }

//    ChildClass.prototype = Object.create(BaseClass.prototype);
//    Object.defineProperty(ChildClass.prototype, 'constructor', {enumerable: false, value: ChildClass});

//    ChildClass.prototype.parseXML = function( key, value, otherData )
//    {
//        OpenSeadragon.console.log('ChildClass()::parseXML()\n');
//        BaseClass.prototype.parseXML.call(this, key, value);
//    }

//    var a = new ChildClass();
//    var b = new ChildClass();
//    for (var i in a) {    
//      OpenSeadragon.console.log(i);
//    }
//*************************************************************************************************

    var appTitle = 'OpenSeadragonAnnoHost Demo';

    $(window).resize(onWindowResize);
    $(window).resize();

    var tileSource = new OpenSeadragon.LegacyTileSource( [{
        url: 'data/dog_radiograph_2.jpg',
        width: 1909,
        height: 1331
    }] );

    var viewer = OpenSeadragon({
                     debugMode: true,
                     //showReferenceStrip:  true,
                     id: "viewerDiv1",
                     prefixUrl: "content/images/openseadragon/",
                     useCanvas: true,
                     showNavigationControl: true,
                     showNavigator: true,
                     visibilityRatio: 0.1,
                     minZoomLevel: 0.001,
                     maxZoomLevel: 10,
                     zoomPerClick: 1.4,
                     tileSources: ["data/testpattern.dzi", "data/tall.dzi", "data/wide.dzi", tileSource]
                 }),
        imagingHelper = viewer.activateImagingHelper({onImageViewChanged: onImageViewChanged}),
        testTracker = new OpenSeadragon.MouseTracker({element: viewer.container}).setTracking(true),
        viewerInputHook = viewer.addViewerInputHook({hooks: [
            {tracker: 'viewer', handler: 'scrollHandler', hookHandler: onHookOsdViewerScroll},
            {tracker: 'viewer', handler: 'clickHandler', hookHandler: onHookOsdViewerClick}
        ]}),
        annoHost = viewer.activateAnnoHost({}),
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
    });

    viewer.addHandler('close', function (event) {
        outputVM.haveImage(false);
        $osdCanvas.off('mouseenter.osdimaginghelper', onOsdCanvasMouseEnter);
        $osdCanvas.off('mousemove.osdimaginghelper', onOsdCanvasMouseMove);
        $osdCanvas.off('mouseleave.osdimaginghelper', onOsdCanvasMouseLeave);
        $osdCanvas = null;
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

    function setMinMaxZoomForImage() {
        var minzoomX = 50.0 / imagingHelper.imgWidth;
        var minzoomY = 50.0 / imagingHelper.imgHeight;
        var minZoom = Math.min(minzoomX, minzoomY);
        var maxZoom = 10.0;
        imagingHelper.setMinZoom(minZoom);
        imagingHelper.setMaxZoom(maxZoom);
        imagingHelper.setZoomStepPercent(35);
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
        var logPoint = imagingHelper.physicalToLogicalPoint(event.position);
        if (event.scroll > 0) {
            imagingHelper.zoomInAboutLogicalPoint(logPoint);
        }
        else {
            imagingHelper.zoomOutAboutLogicalPoint(logPoint);
        }
        event.stopBubbling = true;
        event.preventDefaultAction = true;
    }

    function onHookOsdViewerClick(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
        if (event.quick) {
            var logPoint = imagingHelper.physicalToLogicalPoint(event.position);
            if (event.shift) {
                imagingHelper.zoomOutAboutLogicalPoint(logPoint);
            }
            else {
                imagingHelper.zoomInAboutLogicalPoint(logPoint);
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
            outputVM.imgWidth(imagingHelper.imgWidth);
            outputVM.imgHeight(imagingHelper.imgHeight);
            outputVM.imgAspectRatio(imagingHelper.imgAspectRatio);
            outputVM.minZoom(imagingHelper.getMinZoom());
            outputVM.maxZoom(imagingHelper.getMaxZoom());
        }
    }

    function updateImgViewerViewVM() {
        if (outputVM.haveImage()) {
            outputVM.zoomFactor(imagingHelper.getZoomFactor());
            outputVM.viewportWidth(imagingHelper._viewportWidth);
            outputVM.viewportHeight(imagingHelper._viewportHeight);
            outputVM.viewportOriginX(imagingHelper._viewportOrigin.x);
            outputVM.viewportOriginY(imagingHelper._viewportOrigin.y);
            outputVM.viewportCenterX(imagingHelper._viewportCenter.x);
            outputVM.viewportCenterY(imagingHelper._viewportCenter.y);
        }
    }

    function onWindowResize() {
        var headerheight = $('.shell-header-wrapper').outerHeight(true);
        var footerheight = $('.shell-footer-wrapper').outerHeight(true);
        $('.shell-view-wrapper').css("top", headerheight);
        $('.shell-view-wrapper').css("bottom", footerheight);
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
        outputVM: ko.observable(outputVM),
    };

    ko.applyBindings(vm);

}());
