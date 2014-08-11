/*
 * GoogleNavigate Plugin for Phonegap
 *
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
package dk.iface.cordova.plugin.googlenavigate;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

public class GoogleNavigate extends CordovaPlugin {

    private static final String LOG_TAG = "GoogleNavigate";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        boolean result;
        Log.d(LOG_TAG, "Executing plugin");

        if ("navigate".equals(action)){
            result = this.navigate(args, callbackContext);
        } else {
            Log.d(LOG_TAG, "Invalid action");
            result = false;
        }

        return result;
    }

    private boolean navigate(JSONArray args, CallbackContext callbackContext){
        boolean result;

        try {
            String query = args.getString(0);

            if (query != null && query.length() > 0) {
                Log.d(LOG_TAG, "Navigating to "+query);
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("google.navigation:q=" + query));
                this.cordova.getActivity().startActivity(i);
                callbackContext.success();
            } else {
                Log.d(LOG_TAG, "Expected non-empty string arguments for query." );
                callbackContext.error("Expected non-empty string arguments for query.");
            }
            result = true;
        }catch( JSONException e ) {
            Log.d(LOG_TAG, "Exception occurred: ".concat(e.getMessage()));
            result = false;
        }
        return result;
    }

}
