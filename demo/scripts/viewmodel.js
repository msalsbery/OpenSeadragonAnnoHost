(function() {

    var appTitle = 'OpenSeadragonAnnoHost Demo';

    $(window).resize(onWindowResize);
    $(window).resize();

    var tileSource = new OpenSeadragon.LegacyTileSource( [{
        url: 'data/dog_radiograph_2.jpg',
        width: 1909,
        height: 1331
    }] );

    var viewer = OpenSeadragon({
                     //debugMode: true,
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
        imagingHelper = viewer.activateImagingHelper({viewChangedHandler: onImageViewChanged}),
        viewerInputHook = viewer.addViewerInputHook({dragHandler: onOSDCanvasDrag, 
                                                     moveHandler: onOSDCanvasMove,
                                                     scrollHandler: onOSDCanvasScroll,
                                                     clickHandler: onOSDCanvasClick}),
        annoHost = viewer.activateAnnoHost({}),
        $osdCanvas = null;

    viewer.addHandler('open', function (event) {
        $osdCanvas = $(viewer.canvas);
        setMinMaxZoomForImage();
        outputVM.haveImage(true);
        $osdCanvas.on('mouseenter.osdimaginghelper', onOSDCanvasMouseEnter);
        $osdCanvas.on('mousemove.osdimaginghelper', onOSDCanvasMouseMove);
        $osdCanvas.on('mouseleave.osdimaginghelper', onOSDCanvasMouseLeave);
        updateImageVM();
        updateImgViewerViewVM();
    });

    viewer.addHandler('close', function (event) {
        outputVM.haveImage(false);
        $osdCanvas.off('mouseenter.osdimaginghelper', onOSDCanvasMouseEnter);
        $osdCanvas.off('mousemove.osdimaginghelper', onOSDCanvasMouseMove);
        $osdCanvas.off('mouseleave.osdimaginghelper', onOSDCanvasMouseLeave);
        $osdCanvas = null;
    });

    // Override OpenSeadragon.Viewer.setFullPage() to remove our knockout-bound elements before a switch to full-page
    //  (temporary fix until there's a 'pre-full-page' event in OpenSeadragon)
    var viewerSetFullPage = OpenSeadragon.Viewer.prototype.setFullPage;
    OpenSeadragon.Viewer.prototype.setFullPage = function (fullPage) {
        if (fullPage) {
            // Going to full-page mode...remove our bound DOM elements
            vm.outputVM(null);
        }
        viewerSetFullPage.call(viewer, fullPage);
    }

    viewer.addHandler('fullpage', function (event) {
        if (!event.fullpage) {
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

    function onOSDCanvasDrag(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
        event.stopBubbling = true;
    }

    function onOSDCanvasMove(event) {
        // set event.stopHandlers = true to prevent any more handlers in the chain from being called
        // set event.stopBubbling = true to prevent the original event from bubbling
        // set event.preventDefaultAction = true to prevent viewer's default action
        event.stopHandlers = true;
        event.stopBubbling = true;
        event.preventDefaultAction = true;
    }

    function onOSDCanvasScroll(event) {
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

    function onOSDCanvasClick(event) {
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

    function onOSDCanvasMouseEnter(event) {
        outputVM.haveMouse(true);
    }

    function onOSDCanvasMouseMove(event) {
        var offset = $osdCanvas.offset();
        outputVM.mousePositionX(event.pageX);
        outputVM.mousePositionY(event.pageY);
        outputVM.elementOffsetX(offset.left);
        outputVM.elementOffsetY(offset.top);
        outputVM.mouseRelativeX(event.pageX - offset.left);
        outputVM.mouseRelativeY(event.pageY - offset.top);
    }

    function onOSDCanvasMouseLeave(event) {
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
