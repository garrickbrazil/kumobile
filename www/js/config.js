/*
 	This file is part of KUMobile.

	KUMobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    KUMobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with KUMobile.  If not, see <http://www.gnu.org/licenses/>.
*/


/******************************************************************************
 *  Contains configuration settings for the KUMobile project
 *
 *  @class KUMobile.Config
 ******************************************************************************/
KUMobile.Config = {


    /******************************************************************************
     *  Delay for loading minimum time (ms) for loading indicator to show for. This 
	 *  was mainly useful to prevent the indicator confusingly flashing.
     *
     *  @attribute LOAD_INDICATOR_DELAY
     *  @type {int}
     *  @for KUMobile.Config
     *  @default 400
     ******************************************************************************/
    LOAD_INDICATOR_DELAY: 400,
    
    
    /******************************************************************************
     *  Is this a device (otherwise assume its a browser/emulator). Some plugins
     *  cannot be used in a browser/emulator and thereby must be determined during
     *  runtime.
	 *
     *  @attribute isDevice
     *  @type {boolean}
     *  @for KUMobile.Config
     *  @default false
     ******************************************************************************/
    isDevice: false,
    
    
    /******************************************************************************
     *  Quick access boolean to determine if the device is of Android platform.
	 *
     *  @attribute isAndroid
     *  @type {boolean}
     *  @for KUMobile.Config
     *  @default false
     ******************************************************************************/
    isAndroid: false,
    
    
    /******************************************************************************
     *  Quick access boolean to determine if the device is of iOs platform.
	 *
     *  @attribute isIOS
     *  @type {boolean}
     *  @for KUMobile.Config
     *  @default false
     ******************************************************************************/
    isIOS: false,
    
    
    /******************************************************************************
     *  Quick access boolean to determine if the device is of Windows platform.
	 *
     *  @attribute isWindows
     *  @type {boolean}
     *  @for KUMobile.Config
     *  @default false
     ******************************************************************************/
    isWindows: false,
    
    
    /******************************************************************************
     *  Default wait time (ms) for incremental searching. 
	 *
     *  @attribute DEFAULT_INCR_WAIT_TIME
     *  @type {int}
     *  @for KUMobile.Config
     *  @default 800
     ******************************************************************************/
    DEFAULT_INCR_WAIT_TIME: 800,
    
    
};