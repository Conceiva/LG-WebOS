var GuiDisplay_Servers = {
		ItemData : null,
		ItemIndexData : null,
		ParentData : null,
		PlaylistId : "",
		Url : "",
		
		totalRecordCount : null,
		
		currentView : "",
		currentMediaType : "",
		
		selectedItem : 0,
		selectedBannerItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 6, //Default TV
		MAXROWCOUNT : 3,
		
		bannerItems : [],
		tvBannerItems : ["Series","Latest","Upcoming","Genre", "A-Z"],
		movieBannerItems : ["All","Unwatched","Latest","Genre", "A-Z"],
		musicBannerItems : ["Recent","Frequent","Album","Album Artist", "Artist"],
		liveTvBannerItems : ["Guide","Channels","Recordings"],
		
		indexSeekPos : -1,
		indexTimeout : null,
		isResume : false,
		genreType : "",
		
		isAllorFolder : 0,
		isTvOrMovies : 0,
		
		startParams : [],
		isLatest : false
}

GuiDisplay_Servers.onFocus = function() {
	/*switch (this.currentMediaType) {
	case "Movies":
	case "TV":
	case "Trailer":
		GuiHelper.setControlButtons("Favourite","Watched","Next Index",GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED" ? "Music" : null,"Return");
	break;
	case "LiveTV":
		GuiHelper.setControlButtons("Favourite",null,null,GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED" ? "Music" : null,"Return");
	break;
	default:
		GuiHelper.setControlButtons("Favourite",null,"Next Index",GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED" ? "Music" : null,"Return");
	}*/
}

GuiDisplay_Servers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiDisplay_Servers.AddDevice = function(device) {
	var found = false;
	
	for (j = 0; j < GuiDisplay_Servers.ItemData.length; j++) {
		var dev = GuiDisplay_Servers.ItemData[j];
		if (dev.ipAddress == device.ipAddress &&
			dev.guid == device.id) {
			found = true;
			break;
		}
	}
	
	var iconUri = "images/server.png";
	if (device.iconArray.length != 0) {
		iconUri = device.iconArray[0].iconUri;
	}
	
	if (!found) {
		GuiDisplay_Servers.ItemData.push({'guid':device.id, 'id':GuiDisplay_Servers.ItemData.length, 'title':device.name, 'ipAddress':device.ipAddress, 'type':'server', 'poster':iconUri});
		GuiDisplay_Servers.updateDisplayedItems();
		GuiDisplay_Servers.updateSelectedItems();
	}
}

GuiDisplay_Servers.RemoveDevice = function(device) {
	
	for (j = 0; j < GuiDisplay_Servers.ItemData.length; j++) {
		var dev = GuiDisplay_Servers.ItemData[j];
		if (dev.ipAddress == device.ipAddress &&
			dev.guid == device.id) {
			delete GuiDisplay_Servers.ItemData[j];
			GuiDisplay_Servers.updateDisplayedItems();
			GuiDisplay_Servers.updateSelectedItems();
			break;
		}
	}
}

GuiDisplay_Servers.handleProvider = function(provider) {
					 // For further details, see the createServiceProvider() or getServiceProvider().
	try {
		var deviceFinder = provider.getDeviceFinder();
		var monitoringCB = {
			ondeviceadded: function (device) {
				GuiDisplay_Servers.AddDevice(device);
				
			},
			ondeviceremoved: function (device) {
				GuiDisplay_Servers.RemoveDevice(device);
			}
		}

		var listenerId = provider.getDeviceFinder().addDeviceDiscoveryListener(monitoringCB);

		var devices = deviceFinder.getDeviceList("MEDIAPROVIDER");
		for (i = 0; i < devices.length; i++) {
			GuiDisplay_Servers.AddDevice(devices[i]);
		}
	} catch(e) {
		GuiNotifications.setNotification("Error: " + e.name,"Error",true);
	}
}

GuiDisplay_Servers.start = function() {	
	console.log("Page Enter : GuiDisplay_Servers");
	GuiMainMenu.changeVisibility("hidden");
	
	if (typeof webapis !== undefined || (typeof webapis !== undefined && webapis.allshare === undefined)) {
		GuiPage_NewServer.start();
		return;
	}
	
	Support.fadeImage("images/bg1.jpg");
	
	//Set Focus for Key Events
	document.getElementById("body").onkeydown = document.getElementById("GuiDisplay_Servers").onkeydown;
	
	//Save Start Params	
	Support.pageLoadTimes("GuiDisplay_Servers","Start",true);
	
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = 0;
	this.topLeftItem = 0;
	this.bannerItems = [];
	this.totalRecordCount = 0;
	this.ItemData = [];
	
		//Update Padding on pageContent
	document.getElementById("pageContent").innerHTML = "<div id=Center class='SeriesCenter'>" +
				"<div id=Content></div>" +
			"</div>";
			
	this.ItemData.push({'id':0, 'title':'Add IP', 'poster':'images/add.png', 'ipAddress':'', 'type':'server'});
	GuiDisplay_Servers.updateDisplayedItems();
	GuiDisplay_Servers.updateSelectedItems();
	this.onFocus();
	
		// Define success callback for creating ServiceProvider
	function sProviderCallback(provider) {
		GuiDisplay_Servers.handleProvider(provider);
	}
	// Define error callback for creating ServiceProvider
	function eProviderCallback(error, state) {
		GuiNotifications.setNotification("Error : " + error.name + "State: " + state,"Error",true);
	}
	// Try to create ServiceProvider object.
	try {
		var provider = webapis.allshare.serviceconnector.getServiceProvider();
		if (provider == null) {
			webapis.allshare.serviceconnector.createServiceProvider(sProviderCallback, eProviderCallback);
		}
		else {
			GuiDisplay_Servers.handleProvider(provider);
		}
	} catch(e) {
		GuiNotifications.setNotification("Error : " + e.message,"Error",true);
	}
}
	
GuiDisplay_Servers.updateDisplayedItems = function() {
	if (this.topLeftItem + this.getMaxDisplay() > this.ItemData.length) {
		if (this.totalRecordCount > this.ItemData.length) {
			this.loadMoreItems();
		}
	}
	
Support.updateDisplayedItems(this.ItemData,this.selectedItem,this.topLeftItem,
		Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"Content","",this.isResume,this.genreType);
}

//Function sets CSS Properties so show which user is selected
GuiDisplay_Servers.updateSelectedItems = function () {
	if (this.isTvOrMovies == 2 || this.ItemData[0].type == "ChannelAudioItem") {
		//Music - Use different styles
		Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"Music seriesSelected","Music","",false,this.totalRecordCount);
	} else {

		Support.updateSelectedNEW(this.ItemData,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.length),"SeriesPortrait seriesSelected highlightMezzmoBoarder","SeriesPortrait","",false,this.totalRecordCount);
	
		
	}
	
	var htmlForTitle = this.ItemData[this.selectedItem].title + "<div style='display:inline-block; position:absolute;'><table style='padding-left:20px;'><tr>";
	
	var toms = this.ItemData[this.selectedItem].CriticRating;
	var stars = this.ItemData[this.selectedItem].CommunityRating;
	var tomsImage = "";
	var starsImage = "";
	if (toms){
		if (toms > 59){
			tomsImage = "images/fresh-40x40.png";
		} else {
			tomsImage = "images/rotten-40x40.png";
		}
		htmlForTitle += "<td class=MetadataItemIcon style=background-image:url("+tomsImage+")></td>";
		htmlForTitle += "<td class=MetadataItemVSmall>" + toms + "%</td>";
	}
	if (stars){
    	if (stars == 0) {
	    		starsImage = "images/stars-0.png";
	    	} else if (stars == 1) {
	    		starsImage = "images/stars-1.png";
	    	} else if (stars == 2) {
	    		starsImage = "images/stars-2.png";
	    	} else if (stars == 3) {
	    		starsImage = "images/stars-3.png";
	    	} else if (stars == 4) {
	    		starsImage = "images/stars-4.png";
	    	} else if (stars == 5) {
	    		starsImage = "images/stars-5.png";
	    	}
    	htmlForTitle += "<td class=MetadataItemIcon style=background-image:url("+starsImage+")></td>";
    	//htmlForTitle += "<td class=MetadataItemVSmall>" + stars + "</td>";
	}
	
	if (this.ItemData[this.selectedItem].type !== undefined
			&& this.ItemData[this.selectedItem].ProductionYear !== undefined) {
		//"" is required to ensure type string is stored!
		text =  "" + Support.SeriesRun(this.ItemData[this.selectedItem].type, this.ItemData[this.selectedItem].ProductionYear, this.ItemData[this.selectedItem].Status, this.ItemData[this.selectedItem].EndDate);

		if (text.indexOf("Present") > -1) {
			htmlForTitle += "<td class='MetadataItemSmallLong'>" + text + "</td>";
		} else {
			htmlForTitle += "<td class='MetadataItemSmall'>" + text + "</td>";
		}
	}
	
	if (this.ItemData[this.selectedItem].OfficialRating !== undefined) {
		htmlForTitle +="<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].OfficialRating + "</td>";
	}
	if (this.ItemData[this.selectedItem].RecursiveItemCount !== undefined) {
		if (this.isAllorFolder == 1) {
			htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Items</td>";	
			if (this.ItemData[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Item</td>";	
			}
		}
		if (this.isTvOrMovies == 2) {
			htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Songs</td>";	
			if (this.ItemData[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].RecursiveItemCount + " Song</td>";	
			}
		} else {
			if (this.ItemData[this.selectedItem].SeasonCount !== undefined) {
				if (this.ItemData[this.selectedItem].SeasonCount == 1){
					htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].SeasonCount + " Season</td>";					
				} else {
					htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData[this.selectedItem].SeasonCount + " Seasons</td>";
				}
			}		
		}	
	}
	
	if (this.ItemData[this.selectedItem].RunTimeTicks !== undefined) {
		htmlForTitle += "<td class='MetadataItemSmall'>" + Support.convertTicksToMinutes(this.ItemData[this.selectedItem].RunTimeTicks/10000) + "</td>";
	}
	
	if (this.ItemData[this.selectedItem].Subtitles !== undefined && this.ItemData[this.selectedItem].Subtitles.length != 0) {
		htmlForTitle += "<td class=MetadataItemIcon style=background-image:url(images/ic_closed_caption_white.png)></td>";
	}

	htmlForTitle += "</tr></table></div>";
			
	htmlForSubData = "";
	if (this.ItemData[this.selectedItem].Genres !== undefined) {
		htmlForSubData = this.ItemData[this.selectedItem].Genres.join(" / ");
	}
				
	htmlForOverview = "";
	if (this.ItemData[this.selectedItem].Overview !== undefined) {
		htmlForOverview = this.ItemData[this.selectedItem].Overview;
	}
	
}

GuiDisplay_Servers.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {	
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding highlightMezzmoText";
			} else {
				document.getElementById("bannerItem"+index).className = "bannerItem highlightMezzmoText";
			}		
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem bannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == this.currentView) {
					document.getElementById("bannerItem"+index).className = "bannerItem offWhite";
				} else {
					document.getElementById("bannerItem"+index).className = "bannerItem";
				}
			}
		}
	}
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem+1) + "/" + this.bannerItems.length;
	}
}

GuiDisplay_Servers.keyDown = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		event.preventDefault();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		//Need Logout Key
		case Common.API.KEY_LEFT:
			console.log("LEFT");	
			this.processLeftKey();
			break;
		case Common.API.KEY_RIGHT:
			console.log("RIGHT");	
			this.processRightKey();
			break;		
		case Common.API.KEY_UP:
			console.log("UP");
			this.processUpKey();
			break;	
		case Common.API.KEY_DOWN:
			console.log("DOWN");
			this.processDownKey();
			break;	
		case Common.API.KEY_PANEL_CH_UP: 
		case Common.API.KEY_CH_UP: 
			this.processChannelUpKey();
			break;			
		case Common.API.KEY_PANEL_CH_DOWN: 
		case Common.API.KEY_CH_DOWN: 
			this.processChannelDownKey();
			break;	
		case Common.API.KEY_RETURN:
			console.log("RETURN");
			event.preventDefault();
			GuiPage_Servers.start();
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER");
			this.processSelectedItem();
			break;
		case Common.API.KEY_PLAY:
			this.playSelectedItem();
			break;	
		case Common.API.KEY_GREEN:
			this.toggleWatchedStatus();
			break;
		case Common.API.KEY_RED:	
			if (this.selectedItem > -1) {
				if (this.ItemData[this.selectedItem].UserData.IsFavorite == true) {
					Server.deleteFavourite(this.ItemData[this.selectedItem].Id);
					this.ItemData[this.selectedItem].UserData.IsFavorite = false;
				} else {
					Server.setFavourite(this.ItemData[this.selectedItem].Id);
					this.ItemData[this.selectedItem].UserData.IsFavorite = true;
				}
				GuiDisplay_Servers.updateDisplayedItems();
				GuiDisplay_Servers.updateSelectedItems();
			}
			break;
		case Common.API.KEY_YELLOW:
			if (!this.isLatest){
				GuiDisplay_Servers.processIndexing();
			}
			break;
		case Common.API.KEY_BLUE:
			//Focus the music player
			if (this.selectedItem == -1) {		
				if (this.selectedBannerItem == this.bannerItems.length-1) {
					GuiMusicPlayer.showMusicPlayer("GuiDisplay_Servers","bannerItem"+this.selectedBannerItem,"bannerItem highlightMezzmoText");
				} else {
					GuiMusicPlayer.showMusicPlayer("GuiDisplay_Servers","bannerItem"+this.selectedBannerItem,"bannerItem bannerItemPadding highlightMezzmoText");
				}
			} else {
				GuiMusicPlayer.showMusicPlayer("GuiDisplay_Servers",this.ItemData[this.selectedItem].Id,document.getElementById(this.ItemData[this.selectedItem].Id).className);
			}
			break;	
		case Common.API.KEY_TOOLS:
			event.preventDefault();
			this.openMenu();
			break;	
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			tizen.application.getCurrentApplication().exit();
			break;
	}
}

 GuiDisplay_Servers.getPortFromURL = function(url) {
  var regex = /^(http|https):\/\/[^:\/]+(?::(\d+))?/;
  var match = url.match(regex);
  if (match === null) {
    return null;
  } else {
    return match[2] ? match[2] : {http: "80", https: "443"}[match[1]];
  }
}

GuiDisplay_Servers.processSelectedItem = function() {
	if (this.selectedItem == 0) {
		GuiPage_NewServer.start();
		return;
	} else if (this.selectedItem != -1) {
		var ipAddress = this.ItemData[this.selectedItem].ipAddress; 
		var port = GuiDisplay_Servers.getPortFromURL(this.ItemData[this.selectedItem].poster); 
		Server.testConnectionSettings(ipAddress + ":" + port,false);
	}
}

GuiDisplay_Servers.toggleWatchedStatus = function () {
	if (this.selectedItem > -1) {
		var titleArray = this.startParams[0].split(" ");
		switch (titleArray[1]) {
		case "Movies":
		case "Trailer":
			if (this.ItemData[this.selectedItem].UserData.Played == true) {
				Server.deleteWatchedStatus(this.ItemData[this.selectedItem].Id);
				this.ItemData[this.selectedItem].UserData.Played = false;
			} else {
				Server.setWatchedStatus(this.ItemData[this.selectedItem].Id);
				this.ItemData[this.selectedItem].UserData.Played = true;
			}
			GuiDisplay_Servers.updateDisplayedItems();
			GuiDisplay_Servers.updateSelectedItems();
			break;
		case "TV": //Mark all episodes of all seasons as watched
			if (this.ItemData[this.selectedItem].UserData.Played == true) {
				Server.deleteWatchedStatus(this.ItemData[this.selectedItem].Id);
				var urlSeasons = Server.getChildItemsURL(this.ItemData[this.selectedItem].Id,"&IncludeItemTypes=Season&fields=SortName");
				var seasons = Server.getContent(urlSeasons);
				for (var s = 0; s < seasons.Items.length; s++){
					Server.deleteWatchedStatus(seasons.Items[s].Id);
				}
				this.ItemData[this.selectedItem].UserData.Played = false;
			} else {
				Server.setWatchedStatus(this.ItemData[this.selectedItem].Id);
				var urlSeasons = Server.getChildItemsURL(this.ItemData[this.selectedItem].Id,"&IncludeItemTypes=Season&fields=SortName");
				var seasons = Server.getContent(urlSeasons);
				for (var s = 0; s < seasons.Items.length; s++){
					Server.setWatchedStatus(seasons.Items[s].Id);
				}
				this.ItemData[this.selectedItem].UserData.Played = true;
			}
			GuiDisplay_Servers.updateDisplayedItems();
			GuiDisplay_Servers.updateSelectedItems();
			break;
		}
	}	
}

GuiDisplay_Servers.playSelectedItem = function () {
	Support.playSelectedItem("GuiDisplay_Servers",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null);
}

GuiDisplay_Servers.openMenu = function() {
	if (this.selectedItem == -1) { //Banner menu
		if (this.currentView == "All" || this.currentView == "Series") {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding offWhite";
			GuiMainMenu.requested("GuiDisplay_Servers","bannerItem0","bannerItem bannerItemPadding highlightMezzmoText");
		} else {
			document.getElementById("bannerItem0").class = "bannerItem bannerItemPadding";
			GuiMainMenu.requested("GuiDisplay_Servers","bannerItem0","bannerItem bannerItemPadding highlightMezzmoText");
		}
	} else if (this.isTvOrMovies == 2) { //Music
		Support.updateURLHistory("GuiDisplay_Servers",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
		GuiMainMenu.requested("GuiDisplay_Servers",this.ItemData[this.selectedItem].Id,"Music Selected");
	} else { //TV or Movies
		Support.updateURLHistory("GuiDisplay_Servers",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
		GuiMainMenu.requested("GuiDisplay_Servers",this.ItemData[this.selectedItem].Id,"SeriesPortrait Selected");
	}
}

GuiDisplay_Servers.processLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		this.updateSelectedBannerItems();
		if (this.selectedBannerItem == -1) { //Going left from the end of the top menu.
			this.selectedBannerItem = 0;
			this.openMenu();
		}
	} else if (this.selectedItem % this.MAXCOLUMNCOUNT == 0){ //Going left from the first column.
		this.openMenu();
	} else {
		this.selectedItem--;
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_Servers.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		}
		this.updateSelectedBannerItems();	
	} else {
		this.selectedItem++;
		if (this.selectedItem >= this.ItemData.length) {
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();		
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				}	
				this.updateDisplayedItems();
			} else {
				this.selectedItem = this.selectedItem - 1;
			}					
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_Servers.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		
		this.selectedItem = 0;
		//update selected item
		this.updateSelectedItems();
			
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}	
}

GuiDisplay_Servers.processDownKey = function() {

	this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
	if (this.selectedItem >= this.ItemData.length) {
		if (this.totalRecordCount > this.ItemData.length) {
			this.loadMoreItems();
			
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
			
		} else {
			this.selectedItem = (this.ItemData.length-1);
			if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
				this.updateDisplayedItems();
			}
		}	
	} else {
		if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
			this.updateDisplayedItems();
		}
	}

	this.updateSelectedItems();
}

GuiDisplay_Servers.processChannelUpKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem - this.getMaxDisplay();
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.updateDisplayedItems();
		} else {
			if (this.topLeftItem - this.getMaxDisplay() < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.getMaxDisplay();
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_Servers.processChannelDownKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem + this.getMaxDisplay();
		if (this.selectedItem >= this.ItemData.length) {	
			
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();
				
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}		
			} else {
				this.selectedItem = (this.ItemData.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}	
		} else {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_Servers.processIndexing = function() {
	if (this.currentMediaType == "LiveTV") {
		return;
	}
	if (this.selectedItem > -1) {
		var indexLetter = this.ItemIndexData[0];
		var indexPos = this.ItemIndexData[1];
		
		var letterSelected = this.ItemData[this.selectedItem].SortName.charAt(0).toLowerCase();
		if(new RegExp("^([^a-z])").test(letterSelected)){
			letterSelected = "#";
		}
		
		var indexSeekPos = 0; //Safety
		for (var i = 0; i < indexLetter.length; i++) {
			if (letterSelected == indexLetter[i]) {
				indexSeekPos = i+1;
				break;
			}
		}
		
		if (indexSeekPos >= indexPos.length) {
			//Check if more items, if so load next batch
			if (this.totalRecordCount > this.ItemData.length) {
				this.loadMoreItems();
				//If we were skipping through the alphabet we need to bail here.
				if (this.indexTimeout){
					return;
				}
			} else {
				indexSeekPos = 0;
				this.topLeftItem = 0;
			}
		}
		
		this.selectedItem = indexPos[indexSeekPos];
		this.topLeftItem = this.selectedItem; //safety net
		
		for (var i = this.selectedItem; i > this.selectedItem-this.MAXCOLUMNCOUNT; i--) {		
			if (i % this.MAXCOLUMNCOUNT == 0) {
				this.topLeftItem = i;
				break;
			}
		}
		
		
		clearTimeout(this.indexTimeout);
		this.indexTimeout = setTimeout(function(){
			GuiDisplay_Servers.updateDisplayedItems();
			GuiDisplay_Servers.updateSelectedItems();
		}, 500);
		
		
	}
}

GuiDisplay_Servers.loadMoreItems = function() {
	if (this.totalRecordCount > this.ItemData.length) {
		Support.pageLoadTimes("GuiDisplay_Servers","GetRemainingItems",true);
		
		//Show Loading Div
		document.getElementById("loading").style.visibility = "";
		
		//Remove User Control
		document.getElementById("body").onkeydown = document.getElementById("NoKeyInput").onkeydown;
		
		//Load Data
		var originalLength = this.ItemData.length
		
		//Show Loading Div
		document.getElementById("loading").style.visibility = "";
		
		if (this.PlaylistId.indexOf("cvasearch:") == 0) {
			var term = this.PlaylistId.substr(10, this.PlaylistId.length);
			Server.Browse(this.Url, "Search", term, "BrowseDirectChildren", originalLength, 100, "", this.ItemData, GuiDisplay_Servers.loadMoreData);
		}
		else {
			Server.Browse(this.Url, "Browse", this.PlaylistId, "BrowseDirectChildren", originalLength, 100, "", this.ItemData, GuiDisplay_Servers.loadMoreData);
		}
	}
}

GuiDisplay_Servers.loadMoreData = function(itemData, NumberReturned, TotalMatches) {	
	Support.pageLoadTimes("GuiDisplay_Servers","GotRemainingItems",false);
	
	this.ItemData = itemData;
	
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + TotalMatches;
	
	//Reprocess Indexing Algorithm
	this.ItemIndexData = Support.processIndexing(this.ItemData); 
	
	//Hide Loading Div
	document.getElementById("loading").style.visibility = "hidden";
	
	//Pass back Control
	document.getElementById("body").onkeydown = document.getElementById("GuiDisplay_Servers").onkeydown;
	
	Support.pageLoadTimes("GuiDisplay_Servers","AddedRemainingItems",false);

}

GuiDisplay_Servers.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}