var GuiPage_Search = {
		ItemData : null,
		startParams : [],
		
		selectedItem : 0,
		selectedItem2 : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 12,
		
		playItems : ["Play_","View_"]
}

GuiPage_Search.onFocus = function() {
	GuiHelper.setControlButtons(null,null,null,GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED" ? "Music" : null,null);
}

GuiPage_Search.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_Search.start = function(title, url, term) {
	console.log("Page Enter : GuiPage_Search");
	GuiMainMenu.changeVisibility("hidden");
	
	//Reset Properties
	this.ItemData = null;
	this.selectedItem = 0;
	this.selectedItem2 = 0;
	this.startParams = [title,url],
		
	Support.fadeImage("images/searchbg.jpg");
	
	//Change Display
	document.getElementById("pageContent").innerHTML = "<div id=SeriesContent class='SeriesContent'>" +
						"<div id='SearchPoster' class='FilmInfoLogo'></div>" +
						"<div id='SeriesTitle' class='SeriesTitle'>" + title + "</div>" +
						"<div id='SeriesSubData' class='SeriesSubData'></div>" +
						"<div id='SeriesOverview' class='SeriesOverview'>Enter a word to search for media:</div>" +
					"</div><div class='SearchPageInput'> \
		<form><input id='searchInput' type='text' size='50' value=''/></form> \
		</div><div id='ResultsTitle' class='SearchPageTitle'></div><div id=Results class='SearchPageResults'></div>";

	document.getElementById("SearchPoster").style.backgroundImage="url('images/ic_search_white.png')";
	document.getElementById("searchInput").value = term;
	
	//Allows time for innerhtml to execute before creating ime
	setTimeout(function () {
		//Create IME
		document.getElementById("body").onkeydown = document.getElementById("GuiPage_Search").onkeydown;
		
		if (title !== undefined && url !== undefined && title != null && url != null) {
	    	
	    	document.getElementById("ResultsTitle").innerHTML = "";
	    	
	    	//Must turn off as cannot catch keys during IME!
	    	Support.screensaverOff();
	    	document.getElementById("searchInput").focus();
	    	
		} else {
			//Must turn off as cannot catch keys during IME!
			Support.screensaverOff();
			document.getElementById("searchInput").focus();
		}
	}, 500);	
}

GuiPage_Search.updateDisplayedItems = function() {
	htmlToAdd = "<table><th style='width:66px'></th><th style='width:72px'></th><th style='width:600px'></th><th style='width:100px'></th>";
	var epName = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.SearchHints.length); index++){
		epName = (this.ItemData.SearchHints[index].Type == "Episode") ? Support.getNameFormat(null,this.ItemData.SearchHints[index].ParentIndexNumber,null,this.ItemData.SearchHints[index].IndexNumber) + " - " + this.ItemData.SearchHints[index].Name : this.ItemData.SearchHints[index].Name;
		htmlToAdd += "<tr><td id=Play_"+this.ItemData.SearchHints[index].ItemId+" class='guiMusic_TableTd'>Play</td><td id=View_"+this.ItemData.SearchHints[index].ItemId+" class='guiMusic_TableTd'>View</td>" +
				"<td id="+ this.ItemData.SearchHints[index].ItemId +" class='guiMusic_TableTd'>" + epName + "</td><td id=Type_"+ this.ItemData.SearchHints[index].ItemId +" class='guiMusic_TableTd'>" + this.ItemData.SearchHints[index].Type + "</td></tr>";		
	}
	document.getElementById("Results").innerHTML = htmlToAdd + "</table>";
}

//Function sets CSS Properties so show which user is selected
GuiPage_Search.updateSelectedItems = function () {
	//Highlight the selected list item.
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.SearchHints.length); index++){	
		if (index == this.selectedItem) {
			for (var index2 = 0; index2 < this.playItems.length; index2++) {
				if (index2 == this.selectedItem2) {
					document.getElementById(this.playItems[index2]+this.ItemData.SearchHints[index].ItemId).className = "guiMusic_TableTd highlightMezzmoBackground";
				} else {
					document.getElementById(this.playItems[index2]+this.ItemData.SearchHints[index].ItemId).className = "guiMusic_TableTd";
				}
			}
		} else {
			document.getElementById(this.ItemData.SearchHints[index].ItemId).className = "guiMusic_TableTd";
			for (var index2 = 0; index2 < this.playItems.length; index2++) {
				document.getElementById(this.playItems[index2]+this.ItemData.SearchHints[index].ItemId).className = "guiMusic_TableTd";
			}
		}
	}

	//Set Counter to be album count or x/3 for top part
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.ItemData.SearchHints.length;	
}

GuiPage_Search.processSelectedItem = function() {
	Support.updateURLHistory("GuiPage_Search",this.startParams[0],this.startParams[1],null,null,0,0,null);
	switch (this.ItemData.SearchHints[this.selectedItem].Type) {
	case "Episode":
	case "Movie":
		if (this.playItems[this.selectedItem2] == "Play_") {
			//Play URL
			var url = Server.getItemInfoURL(this.ItemData.SearchHints[this.selectedItem].ItemId,"&ExcludeLocationTypes=Virtual");
			GuiPlayer.start("PLAY",url,0,"GuiPage_Search");
		} else if (this.playItems[this.selectedItem2] == "View_") {
			//Display Item Page
			var url = Server.getItemInfoURL(this.ItemData.SearchHints[this.selectedItem].ItemId,null);
			GuiPage_ItemDetails.start(this.ItemData.SearchHints[this.selectedItem].Name,url,0);
		}
		break;
	case "Series":
		if (this.playItems[this.selectedItem2] == "Play_") {
			//Play URL
			var url= Server.getChildItemsURL(this.ItemData.SearchHints[this.selectedItem].ItemId,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
			GuiPlayer.start("PlayAll",url,0,"GuiPage_Search");
		} else if (this.playItems[this.selectedItem2] == "View_") {
			//Display Item Page
			var url = Server.getItemInfoURL(this.ItemData.SearchHints[this.selectedItem].ItemId,null);
			GuiTV_Show.start(this.ItemData.SearchHints[this.selectedItem].Name,url,0,0);
		}
		break;	
	default:
		Support.removeLatestURL();
		GuiNotifications.setNotification(this.ItemData.SearchHints[this.selectedItem].Type + " hasn't been implemented in search yet.", "To Be Done")
	}
}




GuiPage_Search.keyDown = function() {
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
		case Common.API.KEY_LEFT:
			this.processLeftKey();
			break;
		case Common.API.KEY_RIGHT:
			this.processRightKey();
			break;	
		case Common.API.KEY_UP:
			this.processUpKey();
		break;
		case Common.API.KEY_DOWN:
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
		case 169:
			console.log("RETURN");
			event.preventDefault();
			Support.processReturnURLHistory();
			break;	
		case Common.API.KEY_ENTER:
		case Common.API.KEY_PANEL_ENTER:
		case 65376:
			console.log("ENTER");
			event.preventDefault();
			if (document.getElementById("searchInput") != null) {
		        var searchString = document.getElementById("searchInput").value;
		        if (searchString != "") {
					var url = Server.getServerAddr();	
					var thisItem = {"title":"Search", "poster":"images/ic_search_white.png", "Overview":"Results of search for '" + searchString + "'"};
					thisItem.title = "Search";
					thisItem.Overview = "Results of search for '" + searchString + "'";
					thisItem.poster ="images/ic_search_white.png";
					Support.updateURLHistory("GuiPage_Search",GuiPage_Search.startParams[0],GuiPage_Search.startParams[1],null,null,0,0,null,searchString,thisItem);
					GuiDisplay_MediaItems.start("Search: " + searchString,url, 0,0, GuiPage_Search.ItemData, "cvasearch:" + searchString, thisItem);
		        }
			}
			break;	
		case Common.API.KEY_TOOLS:
			event.preventDefault();
			this.openMenu(true);
			break;	
		case Common.API.KEY_YELLOW:	
			//Favourites - May not be needed on this page
			break;				
		case Common.API.KEY_BLUE:	
			GuiMusicPlayer.showMusicPlayer("GuiPage_Search",this.playItems[this.selectedItem2]+this.ItemData.SearchHints[this.selectedItem].ItemId,"guiMusic_TableTd highlightMezzmoBackground");
			break;	
		case Common.API.KEY_EXIT:
			console.log("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiPage_Search.openMenu = function(hasData) {
	if (hasData) {
		Support.updateURLHistory("GuiPage_Search",this.startParams[0],this.startParams[1],null,null,0,0,null);
		
		for (var index = 0; index<this.playItems.length;index++) {
			document.getElementById(this.playItems[index]+this.ItemData.SearchHints[this.selectedItem].ItemId).className = "guiMusic_TableTd";
		}
		this.selectedItem2 = 0;
		GuiMainMenu.requested("GuiPage_Search",this.playItems[this.selectedItem2]+this.ItemData.SearchHints[this.selectedItem].ItemId,"guiMusic_TableTd highlightMezzmoBackground");
	} else {
		Support.updateURLHistory("GuiPage_Search",null,null,null,null,null,null,null);
		GuiMainMenu.requested("GuiPage_Search","searchInput");
	}
}

GuiPage_Search.processUpKey = function() {
	this.selectedItem--;
	if (this.selectedItem < 0) {
		//Reset and focus on IME
		this.selectedItem2 = 0;
		this.updateSelectedItems();
		
		//Must turn off as cannot catch keys during IME!
		Support.screensaverOff();
		
		document.getElementById("searchInput").focus();
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

GuiPage_Search.processDownKey = function() {
	this.selectedItem++;
	if (this.selectedItem >= this.ItemData.SearchHints.length) {
		this.selectedItem--;
		if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
	} else {
		if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
			this.topLeftItem++;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
}

GuiPage_Search.processLeftKey = function() {
	this.selectedItem2--;
	if (this.selectedItem2 == -1) {
		this.selectedItem2 = 0;
		this.openMenu(true);
	} else {
		this.updateSelectedItems();
	}
}

GuiPage_Search.processRightKey = function() {
	this.selectedItem2++;
	if (this.selectedItem2 > this.playItems.length-1) {
		this.selectedItem2--;
	} else {
		this.updateSelectedItems();
	}
}

GuiPage_Search.processChannelUpKey = function() {
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

GuiPage_Search.processChannelDownKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem + this.getMaxDisplay();
		if (this.selectedItem >= this.ItemData.SearchHints.length) {		
			this.selectedItem = (this.ItemData.SearchHints.length-1);
			if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay()) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			}
			this.updateDisplayedItems();
		} else {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}