/*
 * Copyright (c) 2013 interFace ApS (kontakt@interface.dk)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 */
var exec = require('cordova/exec');

var GoogleNavigate = {};

/**
 * Opens google navigation to navigate to given query destination
 *
 * @param {String} query - destintation
 * @param {Function} successCallback - The callback which will be called when plugin call is successful.
 * * @param {Function} errorCallback - The callback which will be called when plugin encounters an error.
 * This callback function have a string param with the error.
 */
GoogleNavigate.navigate = function(query, successCallback, errorCallback) {
    return cordova.exec(successCallback,
                        errorCallback,
                        'GoogleNavigate',
                        'navigate',
                        [query]);
};

module.exports = GoogleNavigate;
