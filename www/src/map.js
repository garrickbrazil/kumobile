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


/*

	http://mapicons.nicolasmollet.com/markers/restaurants-bars/restaurants/restaurant/
	http://mapicons.nicolasmollet.com/markers/culture-entertainment/culture/theater/
	http://mapicons.nicolasmollet.com/markers/stores/general-merchandise/supermarket/
	http://mapicons.nicolasmollet.com/markers/offices/bank/
	http://mapicons.nicolasmollet.com/markers/transportation/road-transportation/filling-station/
	http://mapicons.nicolasmollet.com/markers/transportation/road-transportation/repair/
	http://mapicons.nicolasmollet.com/markers/sports/relaxing-sports/weight-lifting/
	http://mapicons.nicolasmollet.com/markers/restaurants-bars/bars/cocktail-bar/
	http://mapicons.nicolasmollet.com/markers/transportation/road-transportation/bus-stop/
	http://mapicons.nicolasmollet.com/markers/health-education/health/ambulance/
	

*/



/**********************************************************
 * KU Map
 *********************************************************/
 var KU_Map = {
	
	map: null,							// leaflet map object
	loading: false,						// loading?
	markers: null,						// existing markers
	timeoutSent: null,					// sent timeout for search
	swLat: 42.97513915795521,			// boundng box sw lat
	swLng: -83.77864837646484,			// bounding box sw lng
	neLat: 43.05107777204538,			// bounding box ne lat	
	neLng: -83.64904403686523,			// bounding box ne lng
	bTolerance: .011,					// tolerance for map lock
	downloadIndex: 0,					// still downloading?
	serializeID: 1,						// version for serialization
	lastValue: "",						// search value for filter
	KEY_WAIT: 850,						// timeout when typing
	MAX_UPDATE_MS: 86400000,			// ms value as max places update
	MAP_FILE_TEMPLATE: "MAP_DATA_",		// map data template
	debug: false,						// debug verbose messages?
	GREY_MAP: false,					// grey map around background
	footer: false,						// footer size
	selectedMarker: null, 				// marker currently selected
	
	/**********************************************************
	 * Clear markers
	 *********************************************************/
	clearMarkers: function(){
		
		// Nothing to delete?
		if(this.markers != null){
		
			// Delete each marker from map
			for(var index = 0; index < this.markers.length; index++){
				
				this.map.removeLayer(this.markers[index]);
			}
		}
		
		// Setup new array!
		this.markers = new Array();
	},
	
	/**********************************************************
	 * Update POI
	 *********************************************************/
	updatePOIs: function(){
		
		// Current category
		var category = this.categoriesList[this.downloadIndex].id;
		
		// Box for URL calls
		var box = "&sw=" + this.swLat + "," + this.swLng 
			+ "&ne=" + this.neLat + "," + this.neLng;
		
		// Gather URL
		// also pretty pyramid
		var url = "https://api.foursquare.com/v2/venues/search?"
					+ "&client_id=IUQ5QBLLKXQFIK4VYCFKHMX1ABZBXKMCQCLE4H3B4AUIK1D5"
					+ "&client_secret=YAHWXV2G53YG531G1LVMOAXRZMMY20W2GM5VNPPEBOPU2505"
					+ "&categoryId=" + category
					+ "&intent=browse"
					+ "&v=20140709"
					+ "&limit=50"
					+ box;
		
		// Download new information!
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'html',
			success: function(data) {
			
				// Parse result
				var result = JSON.parse(data);
				var category = KU_Map.categoryData[KU_Map.downloadIndex];
		
				// Is result valid?
				if(result != null && result.response != null && result.response.venues != null){
					
					// Make new object then save date!
					category = {"name":KU_Map.categoriesList[KU_Map.downloadIndex].name, "serializeID": KU_Map.serializeID, "date": 0, "pois":[]};
					category.date = (new Date()).getTime();
					
					// All POI's
					for(var index = 0; index < result.response.venues.length; index++){
					
						var current = result.response.venues[index];
						
						// Valid POI?
						if(current.name != null 
							&& current.location != null
							&& current.location.lat != null
							&& current.location.lng != null){
							
							category.pois[category.pois.length] = current;
						}
					}

					// Save new category here!
					if(KU_Config.isDevice){
						
						var categoryStr = JSON.stringify(category);
						
						// Successful write?
						var success = function(){
							
							if(KU_Map.debug) alert("Saved successfully");
							
							// Get next POI category
							KU_Map.downloadIndex++;
							KU_Map.readPOIs();
						};
						
						// Failure write?
						var fail = function(errorcode){
						
							if(KU_Map.debug) alert("Save failed");
							
							// Get next POI category
							KU_Map.downloadIndex++;
							KU_Map.readPOIs();
						};
						
						// Save category to sd and memory
						fileName = KU_Map.MAP_FILE_TEMPLATE + category.name;
						KU_Map.categoryData[KU_Map.downloadIndex] = category;
						KU_FileIO.writeToFile(fileName, categoryStr, success, fail);
						
					}
					
					// Not a device
					else{
						
						// Save category to memory
						KU_Map.categoryData[KU_Map.downloadIndex] = category;
						
						// Get next POI category
						KU_Map.downloadIndex++;
						KU_Map.readPOIs();
					
					}
				}
				
				// No fallback? alert error then move on
				else if(category == null){
				
					// Tell user about error loading from file AND downloading
					alert("There was an issue loading " + KU_Map.categoriesList[KU_Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					
					// Get next POI category
					KU_Map.downloadIndex++;
					KU_Map.readPOIs();
				}
				
				// Fallback data is already in place for this category
				// move on to next one and try to update next time we load.
				else{
				
					// Get next POI category
					KU_Map.downloadIndex++;
					KU_Map.readPOIs();
				}
			},
			
			error: function(data){
				
				if(KU_Map.categoryData[KU_Map.downloadIndex] == null){
				
					// Tell user about error loading from file AND downloading
					alert("There was an issue loading " + KU_Map.categoriesList[KU_Map.downloadIndex].name 
						+ ".\nPlease try again later.");
					
				}
				
				// Error downloading POI info?
				KU_Map.downloadIndex++;
				KU_Map.readPOIs();
			}
		});
	
	},
 
	/**********************************************************
	 * Read POI files
	 *********************************************************/
	readPOIs: function(){
		
		// Started?
		if(this.downloadIndex == 0){
		
			// Disable searching
			$("#map-search").addClass("ui-disabled");
			//$("#map-select").addClass("ui-disabled");
			KU_Mods.showLoading("map-header");
		}
		
		// All done?
		else if(this.downloadIndex < 0 || this.downloadIndex >= this.categoriesList.length){
			
			// All done with categories!
			$("#map-search").removeClass("ui-disabled");
			//$("#map-select").removeClass("ui-disabled");
			KU_Mods.hideLoading("map-header");
			KU_Map.loading = false;
			KU_Map.filterMap();
			return;
		}
		
		//  Save file?
		if(KU_Config.isDevice){
			
			var fileName = KU_Map.MAP_FILE_TEMPLATE + KU_Map.categoryData[KU_Map.downloadIndex].name;
			KU_FileIO.readFromFile(fileName, KU_Map.readPOI_Success, KU_Map.readPOI_Fail);
		}
		
		// Simply update the next POI
		else{
		
			KU_Map.updatePOIs();
		}
		
	},
	
	
	/**********************************************************
	 * Read POI files  - Success
	 *********************************************************/
	readPOI_Success: function(result){
		
		// Parse result
		try{
			category = JSON.parse(result);
		}
		
		catch(e){
			category = null;
		}
		
		if(category != null){
			
			var currentDate = (new Date()).getTime();
			var date = category.date;
			var serial = category.serializeID;
			var pois = category.pois;
			
			// Completely valid category?
			if(currentDate != null
				&& date != null
				&& serial != null
				&& pois != null
				&& serial == KU_Map.serializeID){

				// Date is not due, pois are reasonable length
				if((date + KU_Map.MAX_UPDATE_MS) > currentDate && pois.length > 5){
				
					if(KU_Map.debug) alert("Read Category " + KU_Map.downloadIndex);
					
					// Store category!
					KU_Map.categoryData[KU_Map.downloadIndex] = category;
					KU_Map.downloadIndex++;
					KU_Map.readPOIs();
				
				}
				
				// New date needs to be saved
				else{
					
					if(KU_Map.debug) alert("Need a new update! " + KU_Map.downloadIndex);
					
					// Fallback is old data!
					KU_Map.categoryData[KU_Map.downloadIndex] = category;
					KU_Map.updatePOIs();
					
				}
			}		
			
			// Invalid or out of date category
			else{
				
				
				if(KU_Map.debug) {
					alert("Date " + (date != null)
					+ " serial " + (serial != null)
					+ " pois " +  (pois != null)
					+ " same serial " +  (serial == KU_Map.serializeID)
					+ " kuserial " + (KU_Map.serializeID));
					alert("Couldn't read " + KU_Map.downloadIndex);
				}
				
				// Update!
				//KU_Map.categoryData[KU_Map.downloadIndex] = null;
				KU_Map.updatePOIs();
			}
		}
		
		// Invalid
		else{
			
			alert("I'm here 2");
			if(KU_Map.debug) alert("Couldn't read " + KU_Map.downloadIndex);
			
			// Update!
			//KU_Map.categoryData[KU_Map.downloadIndex] = null;
			KU_Map.updatePOIs();
		}
		
	},
	
	/**********************************************************
	 * Read POI files - Fail
	 *********************************************************/
	readPOI_Fail: function(errorcode){
		
		if(KU_Map.debug) alert("Failed to read " + KU_Map.downloadIndex);
		
		// Download needed?
		KU_Map.updatePOIs();
	},
	
	/**********************************************************
	 * Filters the map markers
	 *********************************************************/
	filterMap: function(){
		
		$('#poi-info').hide();
		KU_Map.footer = false;
		var temp = "-1";
		switch(temp){
			
			// All selected
			case "-1":
			
				this.clearMarkers();
			
				// Don't bother showing EVERYTHING
				if(this.lastValue == "") return;
				
				// All  POI categories
				for(var index = 0; index < this.categoryData.length - 1; index++){
				
					this.addPOIs(this.categoryData[index]);
					if(index == 0) this.addPOIs(this.categoryData[this.categoryData.length - 1]);
				}
				
				break;
			
			default: 
				/*
				// Clear then add
				this.clearMarkers();
				
				this.addPOIs(this.categoryData[$("#map-select option:selected").val()]);
				if($("#map-select option:selected").val() == 0) this.addPOIs(this.categoryData[KU_Map.categoriesList.length - 1]); 
				*/
		}
		
		if(this.markers.length < 1) return;
		
		// Get starting point
		var user = (KU_Map.userLoc)? KU_Map.userLoc.getLatLng(): L.latLng(43.013070, -83.713853);
		
		
		// Is user location outside of range?
		if(user.lat > KU_Map.neLat || user.lat < KU_Map.swLat || user.lng > KU_Map.nwLat || user.lng < KU_Map.swLng){
			
			// Force kettering's location
			user = L.latLng(43.013070, -83.713853);
		}
		
		var nearestPOI = this.markers[0].getLatLng();
		var smallestDistance = user.distanceTo(nearestPOI);
		var nearestMarker = this.markers[0];
		
		// Bring user to nearest point!
		for(var index = 1; index < this.markers.length; index++){
			
			// Compute distance
			var current = this.markers[index].getLatLng();
			var distance = user.distanceTo(current);
			
			// Closer point
			if(distance < smallestDistance){
			
				smallestDistance = distance;
				nearestPOI = current;
				nearestMarker = this.markers[index];
			}
		}
		
		var distancePad = .00001;
		/*
		// Having the smallest distance
		// we now need to fit the map to
		// the users position and that point!
		var sw_Lat = (user.lat < nearestPOI.lat)? user.lat- smallestDistance*distancePad:nearestPOI.lat - smallestDistance*distancePad;
		var sw_Lng = (user.lng < nearestPOI.lng)? user.lng- smallestDistance*distancePad:nearestPOI.lng - smallestDistance*distancePad;
		var ne_Lat = (user.lat > nearestPOI.lat)? user.lat+ smallestDistance*distancePad:nearestPOI.lat + smallestDistance*distancePad;
		var ne_Lng = (user.lng > nearestPOI.lng)? user.lng+ smallestDistance*distancePad:nearestPOI.lng + smallestDistance*distancePad;
		
		// Pad the zoom level
		var padding = (this.lastValue == "")? .0028:.00165;
		sw_Lat -= padding;
		sw_Lng -= padding;
		ne_Lat += padding;
		ne_Lng += padding;
		
		var bounds = L.latLngBounds(L.latLng(sw_Lat, sw_Lng),
						L.latLng(ne_Lat, ne_Lng));
		*/
		
		var padding = .0014;
		
		var bounds = L.latLngBounds(L.latLng(nearestPOI.lat - padding, nearestPOI.lng - padding*.95),
						L.latLng(nearestPOI.lat + padding/8, nearestPOI.lng + padding));
		
		var slightlyNorthPOI = L.latLng(nearestPOI.lat - padding, nearestPOI.lng);
		
		// Fit bounds then open!
		if(this.lastValue != ""){// || $("#map-select option:selected").val() != -1){
			
			//KU_Map.map.fitBounds(bounds);
			KU_Map.map.setView(slightlyNorthPOI, 16);
			
			
			KU_Map.deselectMarker();
			
			var selectedIcon = L.icon({
				iconUrl: 'images/map-icons/' + nearestMarker.icon.replace('.png','-selected.png'),
				iconSize:     [25, 29], // size of the icon
				iconAnchor:   [12, 29]  // point of the icon which will correspond to marker's location
			});
			
			KU_Map.showMapDetails(nearestMarker.poi);			
			KU_Map.selectedMarker = {'marker': nearestMarker, 'iconName': nearestMarker.icon};
			nearestMarker.setIcon(selectedIcon);
		}
	},
	
	/**********************************************************
	 * Add POIs
	 *********************************************************/
	addPOIs: function(category){
		
		if(category == null) return;
		
		// All POI's in category
		for(var index = 0; index < category.pois.length; index++){
		
			var current = category.pois[index];
			
			var icon = "";
			if(category.name == "Food" || category.name == "Fast Food") icon = "fastfood.png";
			else if(category.name == "Entertainment") icon = "theater.png";
			else if(category.name == "Shop/Services") icon = "mall.png";
			else if(category.name == "Bank") icon = "bank.png";
			else if(category.name == "Gas Station") icon = "fillingstation.png";
			else if(category.name == "Automotive Repair") icon = "carrepair.png";
			else if(category.name == "Fitness") icon = "weights.png";
			else if(category.name == "Bar") icon = "bar_coktail.png";
			else if(category.name == "Travel") icon = "busstop.png";
			else if(category.name == "Emergency") icon = "ambulance.png";
			
			var customIcon = L.icon({
				iconUrl: 'images/map-icons/' + icon,
				iconSize:     [25, 29], // size of the icon
				iconAnchor:   [12, 29], // point of the icon which will correspond to marker's location
			});
			
			var categorylist = "";
		
			// Compile categories
			for(var i = 0; i < current.categories.length; i++){
			
				if(i == (current.categories.length -1)) categorylist += current.categories[i].name;
				else categorylist += current.categories[i].name + ", ";
			}
			
			// Valid POI?
			if(current.name != null 
				&& current.location != null
				&& current.location.lat != null
				&& current.location.lng != null
				&& ((current.name.toLowerCase().indexOf(this.lastValue.toLowerCase()) > -1)  || (categorylist.toLowerCase().indexOf(this.lastValue.toLowerCase()) > -1))  ){
				
				// Create marker
				var tempMarker = 
					L.marker([current.location.lat, current.location.lng], {icon: customIcon})
					 .on('click', function(e) {
						
						if(KU_Map.selectedMarker != null){
							
							KU_Map.deselectMarker();
						}
						
						// Find correct marker
						for(var i = 0; i < KU_Map.markers.length; i++){
							if(KU_Map.markers[i].getLatLng() === e.latlng){
								
								var selectedIcon = L.icon({
									iconUrl: 'images/map-icons/' + icon.replace('.png','-selected.png'),
									iconSize:     [25, 29], // size of the icon
									iconAnchor:   [12, 29], // point of the icon which will correspond to marker's location
								});
								
								KU_Map.showMapDetails(KU_Map.markers[i].poi);
								KU_Map.markers[i].setIcon(selectedIcon);
								KU_Map.selectedMarker = {'marker': KU_Map.markers[i], 'iconName': icon};
							}
						}
				});
				tempMarker.icon = icon;
				var nonRedundent = true;

				if(category.name == "Fast Food"){
					
					for(var i = 0; i < KU_Map.markers.length; i++){
					
						nonRedundent = !(KU_Map.markers[i].getLatLng().equals(tempMarker.getLatLng())); 
						if(!nonRedundent) break;
					}
				}
				
				// POI does not already exist in the list?
				if(nonRedundent){
					
					tempMarker.addTo(KU_Map.map);
					tempMarker.poi = current;
					KU_Map.markers[KU_Map.markers.length] = tempMarker;
				}
			}
		}
	
	},
 
	deselectMarker: function(){
	
		if(KU_Map.selectedMarker == null) return;
	
		var deselectedIcon = L.icon({
			iconUrl: 'images/map-icons/' + KU_Map.selectedMarker.iconName,
			iconSize:     [25, 29], 	// size of the icon
			iconAnchor:   [12, 29], 	// point of the icon which will correspond to marker's location
		});
	
		// Revert latest marker
		KU_Map.selectedMarker.marker.setIcon(deselectedIcon);
		KU_Map.selectedMarker = null;
	},
 
	showMapDetails: function(poi){
	
		$(window).trigger("throttleresize");
		// Show footer if needed
		if(!KU_Map.footer){
			KU_Map.footer = true;
			$('#poi-info').show();	
		}
		
		// Put in real info
		$("#poi-info-name").text(poi.name);
		
		var categorylist = "";
		
		// Compile categories
		for(var i = 0; i < poi.categories.length; i++){
		
			if(i == (poi.categories.length -1)) categorylist += poi.categories[i].name;
			else categorylist += poi.categories[i].name + ", ";
		}
		
		if(categorylist != "") $("#poi-info-categories").text(categorylist);
		
		
		if(poi.location.address && poi.location.city && poi.location.state){
			
			
			$("#poi-info-address").text(poi.location.address + ", " +  poi.location.city + " " + poi.location.state);
		}
		else if (poi.location.lat && poi.location.lng){
		
			$("#poi-info-address").text(poi.location.lat + ", " + poi.location.lng);
		}
		
		if(poi.contact.formattedPhone){
			$("#poi-button-phone").removeClass("ui-disabled");
			$("#poi-info-phone").text(poi.contact.formattedPhone);
		}
		else if (poi.contact.phone){
			$("#poi-button-phone").removeClass("ui-disabled");
			$("#poi-info-phone").text(poi.contact.phone);
		}
		else{
			$("#poi-button-phone").addClass("ui-disabled");
			$("#poi-info-phone").text(String.fromCharCode(160));
		}
		
		
		// If android then use default plugin to launch native navi!
		if(KU_Config.isAndroid){
			
			$("#poi-button-directions").click(function(){
			
				navigator.google_navigate.navigate(poi.location.lat + "," + poi.location.lng, function() {}, function(errMsg) {});
			});
			$("#poi-button-directions").attr('href', " ");
		}
		
		// If iOS then use maps protocol!
		else if (KU_Config.isIOS){
		
			$("#poi-button-directions").attr('href', "maps:daddr=" + poi.location.lat + "," + poi.location.lng);
		}
		
		// Windows phone and other default!
		else{
		
			$("#poi-button-directions").attr('href', "geo:" + poi.location.lat + "," + poi.location.lng);
		}
		
		if(poi.contact.phone){
			
			$("#poi-button-phone").attr('href', "tel:" + poi.contact.phone);
		}
		else if (poi.contact.formattedPhone){
		
			$("#poi-button-phone").attr('href', "tel:" + poi.contact.formattedPhone.replace(/[^0-9]+/g, ""));
		}
		else{
			$("#poi-button-phone").attr('href', "");
		}
		
		
	},
 
	/**********************************************************
	 * Initialize Map
	 *********************************************************/
	initializeMap: function(){

		this.categoryData = [{"name":"Food", "serializeID": KU_Map.serializeID, "date": 0, "pois":[]},
				 {"name":"Entertainment", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Shop/Services", "serializeID": KU_Map.serializeID, "date": 0, "pois":[]},
				 {"name":"Bank", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Gas Station", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Automotive Repair", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Fitness", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Bar", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Travel", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Emergency", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]},
				 {"name":"Fast Food", "serializeID": KU_Map.serializeID,"date": 0, "pois":[]}];
				
		// List of supported categories
		this.categoriesList = [{"name":"Food","id":"4d4b7105d754a06374d81259"},
					 {"name":"Entertainment","id":"4d4b7104d754a06370d81259"},
					 {"name":"Shop/Services","id":"5267e446e4b0ec79466e48c4,4bf58dd8d48988d116951735,4bf58dd8d48988d127951735,52f2ab2ebcbc57f1066b8b43,52f2ab2ebcbc57f1066b8b32,52f2ab2ebcbc57f1066b8b40,52f2ab2ebcbc57f1066b8b42,4bf58dd8d48988d115951735,4bf58dd8d48988d1f1941735,4bf58dd8d48988d114951735,4bf58dd8d48988d11a951735,4eb1bdf03b7b55596b4a7491,4bf58dd8d48988d117951735,4eb1c1623b7b52c0e1adc2ec,4f04ae1f2fb6e1c99f3db0ba,52f2ab2ebcbc57f1066b8b2a,52f2ab2ebcbc57f1066b8b31,52f2ab2ebcbc57f1066b8b3b,4bf58dd8d48988d103951735,52f2ab2ebcbc57f1066b8b18,4d954b0ea243a5684a65b473,4bf58dd8d48988d10c951735,52f2ab2ebcbc57f1066b8b17,4f4532974b9074f6e4fb0104,4bf58dd8d48988d1f6941735,4bf58dd8d48988d1f4941735,52dea92d3cf9994f4e043dbb,52f2ab2ebcbc57f1066b8b1a,4bf58dd8d48988d10f951735,52f2ab2ebcbc57f1066b8b1d,5032872391d4c4b30a586d64,4bf58dd8d48988d122951735,52f2ab2ebcbc57f1066b8b26,503287a291d4c4b30a586d65,52f2ab2ebcbc57f1066b8b3a,52f2ab2ebcbc57f1066b8b16,4bf58dd8d48988d1f7941735,4bf58dd8d48988d11b951735,4bf58dd8d48988d1f9941735,52f2ab2ebcbc57f1066b8b24,52f2ab2ebcbc57f1066b8b1c,4bf58dd8d48988d1f8941735,4bf58dd8d48988d18d941735,4eb1c0253b7b52c0e1adc2e9,4bf58dd8d48988d128951735,52f2ab2ebcbc57f1066b8b19,4bf58dd8d48988d112951735,52f2ab2ebcbc57f1066b8b2c,4bf58dd8d48988d1fb941735,50aaa5234b90af0d42d5de12,52f2ab2ebcbc57f1066b8b36,4bf58dd8d48988d1f0941735,4bf58dd8d48988d111951735,52f2ab2ebcbc57f1066b8b25,52f2ab2ebcbc57f1066b8b33,4bf58dd8d48988d1fc941735,52f2ab2ebcbc57f1066b8b3f,52f2ab2ebcbc57f1066b8b2b,52f2ab2ebcbc57f1066b8b1e,52f2ab2ebcbc57f1066b8b38,52f2ab2ebcbc57f1066b8b29,4bf58dd8d48988d1fd941735,52c71aaf3cf9994f4e043d17,50be8ee891d4fa8dcc7199a7,52f2ab2ebcbc57f1066b8b3c,52f2ab2ebcbc57f1066b8b27,4bf58dd8d48988d1ff941735,4f04afc02fb6e1c99f3db0bc,5032833091d4c4b30a586d60,4bf58dd8d48988d1fe941735,4f04aa0c2fb6e1c99f3db0b8,4f04ad622fb6e1c99f3db0b9,4d954afda243a5684865b473,52f2ab2ebcbc57f1066b8b2f,52f2ab2ebcbc57f1066b8b22,52f2ab2ebcbc57f1066b8b35,4bf58dd8d48988d121951735,52f2ab2ebcbc57f1066b8b34,52f2ab2ebcbc57f1066b8b23,5032897c91d4c4b30a586d69,4bf58dd8d48988d100951735,4eb1bdde3b7b55596b4a7490,52f2ab2ebcbc57f1066b8b20,52f2ab2ebcbc57f1066b8b3d,52f2ab2ebcbc57f1066b8b28,5032885091d4c4b30a586d66,4bf58dd8d48988d10d951735,52f2ab2ebcbc57f1066b8b37,4f4531084b9074f6e4fb0101,4bf58dd8d48988d110951735,52f2ab2ebcbc57f1066b8b1f,52f2ab2ebcbc57f1066b8b39,4bf58dd8d48988d123951735,52f2ab2ebcbc57f1066b8b41,52f2ab2ebcbc57f1066b8b1b,4bf58dd8d48988d1ed941735,4bf58dd8d48988d1f2941735,52f2ab2ebcbc57f1066b8b21,4f04b1572fb6e1c99f3db0bf,5032781d91d4c4b30a586d5b,4d1cf8421a97d635ce361c31,4bf58dd8d48988d1de931735,4bf58dd8d48988d101951735,4bf58dd8d48988d1f3941735,4f04b08c2fb6e1c99f3db0bd,52f2ab2ebcbc57f1066b8b30,4bf58dd8d48988d10b951735,4bf58dd8d48988d126951735,52e816a6bcbc57f1066b7a54,52f2ab2ebcbc57f1066b8b2e"},
					 {"name":"Bank","id":"4bf58dd8d48988d10a951735,52f2ab2ebcbc57f1066b8b56,52f2ab2ebcbc57f1066b8b2d,5032850891d4c4b30a586d62"},
					 {"name":"Gas Station","id":"4bf58dd8d48988d113951735"},
					 {"name":"Automotive Repair","id":"4bf58dd8d48988d124951735,52f2ab2ebcbc57f1066b8b44"},
					 {"name":"Fitness","id":"4bf58dd8d48988d175941735"},
					 {"name":"Bar","id":"4d4b7105d754a06376d81259"},
					 {"name":"Travel","id":"4bf58dd8d48988d1ed931735,4bf58dd8d48988d12d951735,4bf58dd8d48988d1fe931735,4bf58dd8d48988d130951735,4bf58dd8d48988d129951735"},
					 {"name":"Emergency","id":"4bf58dd8d48988d12e941735,4bf58dd8d48988d104941735,4bf58dd8d48988d12c941735"},
					 {"name":"Fast Food","id":"4bf58dd8d48988d16e941735"}];
	
		// Make map
		KU_Map.map = L.map('map_view');
		 
		// Setup layer and zoom
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 6,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> | ' +'Places powered by <a href="http://foursquare.com/">Foursquare</a>'
		}).addTo(KU_Map.map);
		
		// Setup center and default zoom
		KU_Map.map.setView([43.013070, -83.713853], 16, {reset:true});
		
		/*
		var customIcon = L.icon({
			iconUrl: 'images/map-icons/university.png',
			iconSize:     [25, 29], // size of the icon
			iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
			popupAnchor:  [0, 20] 	// point from which the popup should open relative to the iconAnchor
		});
		
		// Permentatly add Kettering to map
		KU_Map.ketteringMarker = L.marker([43.011544, -83.713210], {icon: customIcon})
			.addTo(KU_Map.map)
			.on('click', function(e) {
				
					if(KU_Map.selectedMarker != null){
						
						KU_Map.deselectMarker();
					}
					
					var selectedIcon = L.icon({
						iconUrl: 'images/map-icons/university-selected.png',
						iconSize:     [25, 29], // size of the icon
						iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
						popupAnchor:  [0, 20] 	// point from which the popup should open relative to the iconAnchor
					});
					
					KU_Map.showMapDetails(KU_Map.ketteringMarker.poi);
					KU_Map.ketteringMarker.setIcon(selectedIcon);
					KU_Map.selectedMarker = {'marker': KU_Map.ketteringMarker, 'iconName': 'university.png'};
			}
		);
		
		KU_Map.ketteringMarker.poi = {'name': 'Kettering University', 'categories':[{'name':'Education'},{'name':'University'}], 'location':{'address':'1700 University Ave', 'city':' Flint Township', 'state': 'MI'}, 'contact':{'formattedPhone':'(810) 762-9500', 'phone':'8107629500'}};
		*/
		
		// Make bounding box
		var bounds = L.latLngBounds(L.latLng(this.swLat, this.swLng),
						L.latLng(this.neLat, this.neLng));
		
		// Full grey box!
		var bigBounds = L.latLngBounds(L.latLng(-42.0329743324414,-191.25),
						L.latLng(81.14748070499664,11.25));
		
		// Bottom
		var bigBoundsBottom = L.latLngBounds(L.latLng(bigBounds._southWest.lat, bigBounds._southWest.lng),
						L.latLng(this.swLat, bigBounds._northEast.lng));
		
		// Top
		var bigBoundsTop = L.latLngBounds(L.latLng(this.neLat, bigBounds._southWest.lng),
						L.latLng(bigBounds._northEast.lat,bigBounds._northEast.lng));
		
		// Left middle
		var bigBoundsLeft = L.latLngBounds(L.latLng(this.swLat, bigBounds._southWest.lng),
						L.latLng(this.neLat,this.swLng));
		
		// Right middle
		var bigBoundsRight = L.latLngBounds(L.latLng(this.swLat,this.neLng),
						L.latLng(this.neLat, bigBounds._northEast.lng));
		
		var michiganBox = L.latLngBounds(L.latLng(40.9964840143779,-88.65966796875),
						L.latLng(45.84410779560204,-81.36474609375));
		
		var color = "A0A0A0";
		var opa = .5;
		
		/*
		if(KU_Map.GREY_MAP) L.rectangle(bounds, {color: "#" + color, stroke: true, fillOpacity: 0, weight:1}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsBottom, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsTop, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsLeft, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		if(KU_Map.GREY_MAP) L.rectangle(bigBoundsRight, {color: "#" + color, stroke: false, fillOpacity: opa}).addTo(KU_Map.map);
		
		// Restrict panning to Michigan
		if(KU_Map.GREY_MAP) KU_Map.map.setMaxBounds(michiganBox);
		*/
		
		// Resize the map!
		// Note: this seems to need to be in a timeout function
		// most likely so it is called by a ~anonymous caller.
		setTimeout(function(){
			KU_Map.map.invalidateSize();
		},0);
		
		KU_Map.map.locate({watch: true}).on('locationfound', function(e){
			
			if(KU_Map.userLoc) KU_Map.map.removeLayer(KU_Map.userLoc);
			if(KU_Map.userAccuracy) KU_Map.map.removeLayer(KU_Map.userAccuracy);
			
			KU_Map.userAccuracy = L.circle([e.latitude, e.longitude],e.accuracy/2,{
				stroke:true,
				weight:1,
				opacity:.2,
				fillColor: '#519ad1',
				fillOpacity: .1,
			}).addTo(KU_Map.map);
			
			
			
			var customIcon = L.icon({
				iconUrl: 'images/map-icons/blue_ball.png',
				iconSize:     [22, 22], // size of the icon
				iconAnchor:   [11, 11]
			});
		
			KU_Map.userLoc = L.marker([e.latitude, e.longitude], {icon: customIcon}).addTo(KU_Map.map).bindPopup('<b>You are here</b>!');
		
		}).on('locationerror', function(e){
		
			// Do nothing!
		});
	
		KU_Map.map.on('click', function(e){
			
			if(KU_Map.footer){
			
				if(KU_Map.selectedMarker != null) KU_Map.deselectMarker();
				KU_Map.footer = false;
				$('#poi-info').hide();
			}
			
		});
	
		// Clear markers
		this.clearMarkers();
	}
};
 
/**********************************************************
 * Map page init
 *********************************************************/
$(document).on("pageinit","#map",function(event){
	
	// Bug in JQM? Clear button flashes when loading page?
	// This line will fix it.
	$("#map .ui-input-clear").addClass("ui-input-clear-hidden");
	
	// Initialize map
	// Note: recommended to initialize map from anonymous. 
	// This seems to potentially allow the rest of the 
	// layouts to size correctly without waiting for the map. 
	setTimeout(function(){
		KU_Map.initializeMap();
		KU_Map.readPOIs();
	},0);
	 
});


/**********************************************************
 * Map page create
 *********************************************************/
$(document).on("pagecreate","#map",function(event){
	
	// Trigger for direct change in select box
	/*$("#map-select").bind("change", function(e,u){
		
		// Clear timeout and filter
		if(KU_Map.timeoutSent) clearTimeout(KU_Map.timeoutSent);
		KU_Map.filterMap();
		
	});
	*/
	// Trigger for direct change in search box
	$("#map-search").bind("change", function(e,u){
		
		// Definitely a change?
		if(this.value != KU_Map.lastValue){
		
			// Clear timeout
			if(KU_Map.timeoutSent) clearTimeout(KU_Map.timeoutSent);
			
			// Change last value and filter
			KU_Map.lastValue = this.value;
			KU_Map.filterMap();
			
		}
	});
	
	// Trigger for incremental change in search box
	$("#map-search").keyup( function() {
		
		// Definitely a change?
		if(this.value != KU_Map.lastValue){
		
			// Store value
			KU_Map.lastValue = this.value;
		
			// Clear timeout
			if(KU_Map.timeoutSent) clearTimeout(KU_Map.timeoutSent);
			
			KU_Map.timeoutSent = setTimeout(function(latestValue){
				
				// Definitely not a change?
				if(latestValue == KU_Map.lastValue){
					
					// Save new value, reinit, download
					KU_Map.filterMap();
				}
				
				
			}, KU_Map.KEY_WAIT, this.value);
		}
	});
	
	// Fix iScroll?
	if(KU_Config.ISCROLL) KU_Mods.fixIscroll("#map"); 
	
	// Resize and get first page for overflow
	$(window).trigger("resize");
});
