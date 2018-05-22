var GuiImagePlayer = {	
		ImageViewer : null,
		Canvas : null,
		ItemData : null,
		
		Timeout : null,
		infoTimer : null,
		Paused : false,
		
		overlayFormat : 0, // 0 - date, 1 - date:time, 2 - off 
		
		photos : [],
		
		images : [],
		overlay : [],
        imageIdx : 0,		// Image index
        effectIdx : 0,		// Transition effect index
        effectNames : ['FADE1', 'FADE2', 'BLIND', 'SPIRAL','CHECKER', 'LINEAR', 'STAIRS', 'WIPE', 'RANDOM']
}

//ImageViewer.destroy doesn't work. Set it to null instead.
GuiImagePlayer.kill = function() {
	if (this.ImageViewer != null) {
		this.ImageViewer = null;	
	}
}

GuiImagePlayer.start = function(ItemData,selectedItem,isPhotoCollection) {
	console.log("Page Enter : GuiImagePlayer");
	
	GuiMainMenu.changeVisibility("hidden");
	
	this.images.length = 0;
	
	//Show colour buttons on screen for a few seconds when a slideshow starts.
	document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility="hidden";
	document.getElementById("guiButtonShade").style.visibility = "";
	//GuiHelper.setControlButtons("Favourite","Date/Time","Help",GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED" ? "Music" : null,"Return");
	this.infoTimer = setTimeout(function(){
		GuiHelper.setControlButtons(null,null,null,null,null);
		document.getElementById("Clock").style.visibility = "hidden";
		document.getElementById("guiButtonShade").style.visibility = "hidden";
		document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility="";
	}, 6000);

	//Turn off screensaver
	Support.screensaverOff();

	this.ItemData = ItemData;
	
	var url = "";
	url = ItemData[selectedItem].contentUrl;	

	Support.styleSubtitles("GuiImagePlayer_ScreensaverOverlay")
	
	//Create ARRAY of all URL's!
	//Order from starting selectedItem!
	imageIdx = 0;
	for (var index = 0; index < ItemData.length; index++) {
		//Dont use server function here to prevent these large images caching!
		var temp = ItemData[index].contentUrl;
		this.images.push(temp);
		
		if (ItemData[index].PremiereDate !== undefined) {
			this.overlay.push(Support.formatDateTime(ItemData[index].PremiereDate,1))
		} else {
			this.overlay.push(""); //Need to push something to keep indexes matched up!
		}
	}

	this.imageIdx = selectedItem;
	
	//Initialte new instance, set Frame Area & Set Notifications
	this.Canvas = document.getElementById('imageViewCanvas');
	document.getElementById('imageView').style.visibility = "";
	
    //Set Display Size to screen
    this.Canvas.style.left = 0 + "px"; // set any value
    this.Canvas.style.top = 0 + "px"; // set any value
    this.Canvas.width = window.innerWidth; // set any value
    this.Canvas.height = window.innerHeight; // set any value
	this.Canvas.style.zIndex = 50;
	
	
	//Set Focus for Key Events
	document.getElementById("body").onkeydown = document.getElementById("GuiImagePlayer").onkeydown;
	
    document.getElementById('imageView').onclick = GuiImagePlayer.toggleControls;
	//Start Slide Show
    this.ImageViewer = new Image();

	this.setSlideshowMode();
	//this.setNormalMode();
}

// Set normal mode
// You can play images on the area you set.
GuiImagePlayer.setNormalMode = function() {
	
	sf.service.ImageViewer.setPosition({
		left: 0,
		top: 0,
		width: 1920,
		height: 1080,
	});
	
	sf.service.ImageViewer.show();
	
	for (var i=0; i < this.ItemData.length; i++){
		//Dont use server function here to prevent these large images caching!
		var ImageUrl = this.ItemData[i].contentUrl;
		this.photos[i] = {
		        url: ImageUrl,
		        width: 1920,
		        height: 1080,
		        filename: this.ItemData[i].title,
		        date: '2011/06/24'	
		}
	}
	
	// Draw the image in the specified area defined by "setPosition" function.
    this.ImageViewer.src = ImageUrl;
	
	
	//this.ImageViewer.endSlideshow();
    //playImage();
}

// Set Slideshow mode
// You can use Transtion effect
GuiImagePlayer.setSlideshowMode = function() {
	var delay = File.getUserProperty("ImagePlayerImageTime");
	if (delay === undefined) {
		delay = 10000;
	}
	
    this.ImageViewer.onload = function() {
    	var context = GuiImagePlayer.Canvas.getContext('2d');
    	var width = GuiImagePlayer.ItemData[GuiImagePlayer.imageIdx].contentWidth;
    	var height = GuiImagePlayer.ItemData[GuiImagePlayer.imageIdx].contentHeight;
    	context.clearRect(0, 0, GuiImagePlayer.Canvas.width, GuiImagePlayer.Canvas.height);
    	
    	var hRatio = width / GuiImagePlayer.Canvas.width  ;
	    var vRatio = height / GuiImagePlayer.Canvas.height;
	    var ratio  = Math.min ( hRatio, vRatio );

	    if (hRatio > 1 || vRatio > 1) {
	    	var hRatio =GuiImagePlayer.Canvas.width / width;
		    var vRatio = GuiImagePlayer.Canvas.height / height;
		    var ratio  = Math.min ( hRatio, vRatio );
	    }
		else if (ratio < 0.3) {
	    	ratio = 1;
	    }
		
	    var centerShift_x = ( GuiImagePlayer.Canvas.width - width*ratio ) / 2;
	    var centerShift_y = ( GuiImagePlayer.Canvas.height - height*ratio ) / 2; 
    	context.drawImage(GuiImagePlayer.ImageViewer, 0, 0, width, height, centerShift_x, centerShift_y, width * ratio, height * ratio);
		
		var elem = document.getElementById("imageViewControls");
		if (elem.style.display != "block") {
			clearTimeout(GuiImagePlayer.Timeout);
			Support.setImagePlayerOverlay(GuiImagePlayer.overlay[GuiImagePlayer.imageIdx], GuiImagePlayer.overlayFormat);
			GuiImagePlayer.Timeout = setTimeout(function(){
				if (GuiImagePlayer.Paused == false) {
					GuiImagePlayer.imageIdx = GuiImagePlayer.imageIdx+1;
					if (GuiImagePlayer.imageIdx >= GuiImagePlayer.ItemData.length ) {
						GuiImagePlayer.imageIdx = 0;
					}
					GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
				}
			}, delay);	
		}
    };
	
	this.playImage();
}

//Prepare next image
GuiImagePlayer.prepImage = function(imageIdx) {
    if (GuiImagePlayer.images != null) {
        this.ImageViewer.src = GuiImagePlayer.images[imageIdx];
    }
}

// Play image - only called once in slideshow!
//SS calls  play -> BufferComplete, then the showNow will call RendComplete which starts timer for next image
GuiImagePlayer.playImage = function() {	
	var url = GuiImagePlayer.images[GuiImagePlayer.imageIdx];
	GuiImagePlayer.ImageViewer.src = url;	

	var context = GuiImagePlayer.Canvas.getContext('2d');
	context.clearRect(0, 0, GuiImagePlayer.Canvas.width, GuiImagePlayer.Canvas.height);
}

GuiImagePlayer.toggleControls = function() {
	var elem = document.getElementById("imageViewControls");
	if (elem.style.display == "block") {
		elem.style.display = "none";
		GuiImagePlayer.setSlideshowMode();
	}
	else {
		elem.style.display = "block";
		GuiImagePlayer.pause();
	}
}

GuiImagePlayer.next = function() {
	GuiImagePlayer.imageIdx++;
	if (GuiImagePlayer.imageIdx == GuiImagePlayer.images.length) {
		GuiImagePlayer.imageIdx = 0;	
	}
	GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
}

GuiImagePlayer.prev = function() {
	GuiImagePlayer.imageIdx--;
	if (GuiImagePlayer.imageIdx < 0) {
		GuiImagePlayer.imageIdx = GuiImagePlayer.images.length-1;
	}
	GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
}

GuiImagePlayer.pause = function() {
    clearTimeout(GuiImagePlayer.infoTimer);
    clearTimeout(GuiImagePlayer.Timeout);
}

GuiImagePlayer.back = function() {
	var elem = document.getElementById("imageViewControls");
	elem.style.display = "none";

    clearTimeout(GuiImagePlayer.infoTimer);
    clearTimeout(GuiImagePlayer.Timeout);
    GuiImagePlayer.Timeout = null;
    GuiImagePlayer.images = [];
    GuiImagePlayer.overlay = [];
    document.getElementById("GuiImagePlayer_ScreensaverOverlay").innerHTML = "";
    document.getElementById("guiButtonShade").style.visibility = "hidden";
    //document.getElementById("Clock").style.visibility = ""
    document.getElementById('imageView').style.visibility = "hidden";
    event.preventDefault();
    GuiImagePlayer.kill();
    
    //Turn On Screensaver
    Support.screensaverOn();
    Support.screensaver();
    
    Support.processReturnURLHistory();
}

GuiImagePlayer.keyDown = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		event.preventDefault();
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode){	
		case Common.API.KEY_DOWN:
			event.preventDefault();
			break;
		case Common.API.KEY_STOP:   
		case Common.API.KEY_RETURN:
		case 169:
			console.log("RETURN");
    		clearTimeout(this.infoTimer);
			clearTimeout(this.Timeout);
			this.Timeout = null;
			this.images = [];
			this.overlay = [];
			document.getElementById("GuiImagePlayer_ScreensaverOverlay").innerHTML = "";
			document.getElementById("guiButtonShade").style.visibility = "hidden";
			//document.getElementById("Clock").style.visibility = ""
			document.getElementById('imageView').style.visibility = "hidden";
			event.preventDefault();
			GuiImagePlayer.kill();
			
			//Turn On Screensaver
			Support.screensaverOn();
			Support.screensaver();
			
			Support.processReturnURLHistory();
			break;
		case Common.API.KEY_RIGHT:
			event.preventDefault();
			console.log("RIGHT");
			this.imageIdx++;
			if (this.imageIdx == this.images.length) {
				this.imageIdx = 0;	
			}
			GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			break;
		case Common.API.KEY_LEFT:
			event.preventDefault();
			console.log("LEFT");
			this.imageIdx--;
			if (this.imageIdx < 0) {
				this.imageIdx = this.images.length-1;
			}
			GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			break;
		case Common.API.KEY_PAUSE:
			console.log("PAUSE")
			this.Paused = true
			break;
		case Common.API.KEY_PLAY:
			console.log("PLAY")
			this.Paused = false
			GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			break;
		case Common.API.KEY_RED:	
			if (this.ItemData[this.imageIdx].UserData.IsFavorite == true) {
				Server.deleteFavourite(this.ItemData[this.imageIdx].Id);
				this.ItemData[this.imageIdx].UserData.IsFavorite = false;
				GuiNotifications.setNotification ("Item has been removed from<br>favourites","Favourites");
			} else {
				Server.setFavourite(this.ItemData[this.imageIdx].Id);
				this.ItemData[this.imageIdx].UserData.IsFavorite = true;
				GuiNotifications.setNotification ("Item has been added to<br>favourites","Favourites");
			}
			break;
		case Common.API.KEY_GREEN:
			if (this.overlayFormat == 2) {
				this.overlayFormat = 0;
			} else {
				this.overlayFormat = this.overlayFormat + 1;
			}
			Support.setImagePlayerOverlay(this.overlay[this.imageIdx], this.overlayFormat);
			break;
		case Common.API.KEY_YELLOW:
			GuiHelper.toggleHelp("GuiImagePlayer");
			break;
		case Common.API.KEY_BLUE:	
			GuiMusicPlayer.showMusicPlayer("GuiImagePlayer");
			break;
	}
}

