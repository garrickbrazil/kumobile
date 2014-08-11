PhoneGap Google Navigate Plugin
=================================

* Only works on Android
* Inspired from https://github.com/dpa99c/phonegap-native-navigation

## Using the plugin ##
The plugin creates the object google_navigate with the method navigate(query, success, fail).

    query:   Navigate to location. Can be in "address,zipcode,city" or "lat,lon" form
    success: Called without args. if request was successful
    fail:    Called with errMsg as argument if request was unsuccessful

A full example could be:

    navigator.google_navigate.navigate("Some Road 1, 1234, Some City", function() {
        console.log('Success');
    }, function(errMsg) {
        console.log("Failed: " + errMsg);
    });

License
================

The MIT License

Copyright (c) 2013 interFace ApS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
