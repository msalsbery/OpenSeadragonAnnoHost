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


(function() {

    //if (!Object.create) {
    //    Object.create = (function () {
    //        function F() {}
    //        return function (o) {
    //            if (arguments.length != 1) {
    //                throw new Error('Object.create implementation only accepts one parameter.');
    //            }
    //            F.prototype = o;
    //            return new F()
    //        }
    //    })()
    //}

    //function defineProperties(obj, properties) {
    //    function convertToDescriptor(desc) {
    //    function hasProperty(obj, prop) {
    //        return Object.prototype.hasOwnProperty.call(obj, prop);
    //    }

    //    function isCallable(v) {
    //        // NB: modify as necessary if other values than functions are callable.
    //        return typeof v === "function";
    //    }

    //    if (typeof desc !== "object" || desc === null)
    //        throw new TypeError("bad desc");

    //    var d = {};

    //    if (hasProperty(desc, "enumerable"))
    //        d.enumerable = !!obj.enumerable;
    //    if (hasProperty(desc, "configurable"))
    //        d.configurable = !!obj.configurable;
    //    if (hasProperty(desc, "value"))
    //        d.value = obj.value;
    //    if (hasProperty(desc, "writable"))
    //        d.writable = !!desc.writable;
    //    if ( hasProperty(desc, "get") ) {
    //        var g = desc.get;

    //        if (!isCallable(g) && g !== "undefined")
    //        throw new TypeError("bad get");
    //        d.get = g;
    //    }
    //    if ( hasProperty(desc, "set") ) {
    //        var s = desc.set;
    //        if (!isCallable(s) && s !== "undefined")
    //        throw new TypeError("bad set");
    //        d.set = s;
    //    }

    //    if (("get" in d || "set" in d) && ("value" in d || "writable" in d))
    //        throw new TypeError("identity-confused descriptor");

    //    return d;
    //    }

    //    if (typeof obj !== "object" || obj === null)
    //    throw new TypeError("bad obj");

    //    properties = Object(properties);

    //    var keys = Object.keys(properties);
    //    var descs = [];

    //    for (var i = 0; i < keys.length; i++)
    //    descs.push([keys[i], convertToDescriptor(properties[keys[i]])]);

    //    for (var i = 0; i < descs.length; i++)
    //    Object.defineProperty(obj, descs[i][0], descs[i][1]);

    //    return obj;
    //}

}());
