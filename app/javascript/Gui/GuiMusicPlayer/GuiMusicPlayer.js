var GuiMusicPlayer = {	
		audioElem : null,
		
		currentPlayingItem : 0,
		
		Status : "STOPPED",
		currentTime : 0,
		updateTimeCount : 0,

		videoURL : null,
		
		selectedItem : 0,
		playedFromPage : null,
		selectedDivId : 0,
		selectedDivClass : "",
		previousImagePlayerOverlay : 0,
		
		queuedItems : [],
		shuffledItems : [],
		
		isThemeMusicPlaying : false,
		showThemeId : null,
		
		repeat : "off",
		shuffle : "off",
}

GuiMusicPlayer.onFocus = function() {
	GuiHelper.setControlButtons(null,null,null,null,"Return");
}

GuiMusicPlayer.init = function() {
	GuiPlayer.stopOnAppExit();

	this.audioElem = document.createElement("audio");
	document.body.appendChild(this.audioElem);
	
	//Set up Player
	this.audioElem.addEventListener("error", GuiMusicPlayer.handleError);
	this.audioElem.addEventListener('ended', GuiMusicPlayer.handleOnRenderingComplete, false);
	this.audioElem.addEventListener('timeupdate', GuiMusicPlayer.setCurrentTime, false);
    this.audioElem.addEventListener('loadedmetadata', GuiMusicPlayer.OnStreamInfoReady, false); 
    
    //Set Display Size to 0
    this.audioElem.style.left = 0 + "px"; // set any value
    this.audioElem.style.top = 0 + "px"; // set any value
    this.audioElem.style.width = 0 + "px"; // set any value
    this.audioElem.style.height = 0 + "px"; // set any value
    
    GuiMusicPlayer.setclickHandlers();
}

GuiMusicPlayer.showMusicPlayer = function(playedFromPage,selectedDivId,selectedDivClass) {
	if (this.Status != "STOPPED") {

		this.playedFromPage = playedFromPage;
		this.selectedDivId = selectedDivId;
		
		//Unhighlight the page's selected content
		if (selectedDivId != null) {
			if (selectedDivClass === undefined) {
				this.selectedDivClass = "UNDEFINED";
			} else {
				this.selectedDivClass = selectedDivClass;
			}
			
			if (document.getElementById(selectedDivId) != null) {
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("GuiPage_Setting_Changing arrowUpDown","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlightMezzmoBackground","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlightMezzmoText","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("seriesSelected","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("highlightMezzmoBackground","");
				document.getElementById(selectedDivId).className = document.getElementById(selectedDivId).className.replace("Selected","");
			}
		}
		
		if (playedFromPage == "GuiImagePlayer") {
			clearTimeout(GuiImagePlayer.infoTimer);
			document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility="hidden";
			document.getElementById("guiButtonShade").style.visibility = "";
		}
		document.getElementById("guiMusicPlayerDiv").style.bottom = "-60px";
		document.getElementById("guiMusicPlayerDiv").style.visibility = "";
		$('.guiMusicPlayerDiv').animate({
			bottom: 0
		}, 300, function() {
			//animate complete.
			GuiDisplay_MediaItems.adjustHeight();
		});
		document.getElementById("Counter").style.visibility = "hidden";
		document.getElementById("body").onkeydown = document.getElementById("GuiMusicPlayer").onkeydown;
	}
}

GuiMusicPlayer.start = function(title,currentIndex,playedFromPage,isQueue,showThemeId,itemData) { 
	this.selectedItem = 0;
	
	//Initiate Player for Music if required.
	//Set to null on end of playlist or stop.
	if (this.audioElem == null) {
		this.init();
	}
	
	this.currentPlayingItem = currentIndex;

	//get info from URL
	this.ItemData = itemData;
	if (this.ItemData == null) { Support.processReturnURLHistory(); }	
	
	/*var backsrc = "images/musicbg.jpg";
	if (this.ItemData.backdrop != "") {
		backsrc = this.ItemData.backdrop;
	}
	
	Support.fadeImage(backsrc);*/
	
	//See if item is to be added to playlist or not - if not reset playlist
	if (this.Status != "STOPPED" && (this.isThemeMusicPlaying == true || isQueue == false)) {
		this.stopPlayback();			
	}

	if (title != "Song") { 	
    	for (var index = 0; index < this.ItemData.length; index++) {
    		this.queuedItems.push(this.ItemData[index]);
			this.shuffledItems.push(this.ItemData[index]);
    	}
		
		if (this.shuffle == 'on') {
			this.shuffleArray(this.shuffledItems);
		}
    } else {
    	//Is Individual Song
        this.queuedItems.push(this.ItemData);
		this.shuffledItems.push(this.ItemData);
    }
	
	//Only start if not already playing!
	//If reset this will be true, if not it will be added to queued items
	if (this.Status == "STOPPED") {
		//this.currentPlayingItem = 0;
		if (this.shuffle == 'off') {
			this.videoURL = this.queuedItems[this.currentPlayingItem].contentUrl;
		}
		else {
			this.videoURL = this.shuffledItems[this.currentPlayingItem].contentUrl;
		}

		
	    //Update selected Item
	    //this.updateSelectedItem();
	    
		//Start Playback
		this.handlePlayKey();
		
		//Show Content
		if (this.shuffle == 'off') {
			this.showMusicPlayer(playedFromPage,this.queuedItems[this.currentPlayingItem].id,"Music seriesSelected");
		}
		else {
			this.showMusicPlayer(playedFromPage,this.shuffledItems[this.currentPlayingItem].id,"Music seriesSelected");
		}
	}

	this.shuffle = File.getUserProperty("shuffle");
	if (this.shuffle === undefined) {
		this.shuffle = 'off';
	}
	
	this.repeat = File.getUserProperty("repeat");
	if (this.repeat === undefined) {
		this.repeat = 'off';
	}
	
	if (this.shuffle == 'on') {
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_on.png')";
	}
	else if (this.shuffle == 'off') {
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_off.png')";
	}
	
	if (this.repeat == 'on') {
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_on.png')";
	}
	else if (this.repeat == 'one') {
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_one.png')";
	}
	else if (this.repeat == 'off') {
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_off.png')";
	}
	//this.updateSelectedItem();
}

GuiMusicPlayer.updateSelectedItem = function() {			
	document.getElementById("guiMusicPlayerShuffle").className = "guiMusicPlayerShuffle";
	document.getElementById("guiMusicPlayerRepeat").className = "guiMusicPlayerRepeat";
	document.getElementById("guiMusicPlayerPlay").className = "guiMusicPlayerPlay";
	document.getElementById("guiMusicPlayerStop").className = "guiMusicPlayerStop";
	document.getElementById("guiMusicPlayerPrevious").className = "guiMusicPlayerPrevious";
	document.getElementById("guiMusicPlayerPause").className = "guiMusicPlayerPause";
	document.getElementById("guiMusicPlayerNext").className = "guiMusicPlayerNext";
	
	switch (this.selectedItem ) {

		case 0:
			document.getElementById("guiMusicPlayerShuffle").className = "guiMusicPlayerShuffle highlightMezzmoBoarder";
			break;
		case 1:
			document.getElementById("guiMusicPlayerRepeat").className = "guiMusicPlayerRepeat highlightMezzmoBoarder";
			break;
		case 2:
			document.getElementById("guiMusicPlayerPlay").className = "guiMusicPlayerPlay highlightMezzmoBoarder";
			break;
		case 3:
			document.getElementById("guiMusicPlayerStop").className = "guiMusicPlayerStop highlightMezzmoBoarder";
			break;
		case 4:
			document.getElementById("guiMusicPlayerPrevious").className = "guiMusicPlayerPrevious highlightMezzmoBoarder";
			break;
		case 5:
			document.getElementById("guiMusicPlayerPause").className = "guiMusicPlayerPause highlightMezzmoBoarder";
			break;
		case 6:
			document.getElementById("guiMusicPlayerNext").className = "guiMusicPlayerNext highlightMezzmoBoarder";
			break;
		}
}

//--------------------------------------------------------------------------------------------------

GuiMusicPlayer.keyDown = function() {
	var keyCode = event.keyCode;
	console.log("Key pressed: " + keyCode);
	
	//Returning from blank screen
	if (document.getElementById("everything").style.visibility=="hidden") {
		document.getElementById("everything").style.visibility="";
		
		//Turn On Screensaver
	    Support.screensaverOn();
		Support.screensaver();
		
		//Don't let Return exit the app.
		switch(keyCode) {
		case Common.API.KEY_RETURN:
			event.preventDefault();
			break;
		}
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
			event.preventDefault();
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = 0;
			}
			this.updateSelectedItem();
			break;
		case Common.API.KEY_RIGHT:
			event.preventDefault();
			this.selectedItem++;
			if (this.selectedItem > 6) {
				this.selectedItem = 6;
			}
			this.updateSelectedItem();
			break;
		case Common.API.KEY_ENTER:	
		case Common.API.KEY_PANEL_ENTER:
			console.log("ENTER-player");
			switch (this.selectedItem) {
				case 0:
					this.handleShuffle();
					break;	
				case 1:
					this.handleRepeat();
					break;	
				case 2:
					this.handlePlayKey();
					break;
				case 3:
					this.handleStopKey();
					break;
				case 4:
					this.handlePreviousKey();
					break;
				case 5:
					this.handlePauseKey();
					break;
				case 6:
					this.handleNextKey();
					break;
			}
			break;	
		case Common.API.KEY_PLAY:
			this.handlePlayKey();
			break;	
		case Common.API.KEY_PAUSE:	
			this.handlePauseKey();
			break;
		case Common.API.KEY_STOP:	
			this.handleStopKey();
			break;
		case Common.API.KEY_FF:	
			this.handleNextKey();
			break;
		case Common.API.KEY_RW:	
			this.handlePreviousKey();
			break;
		case Common.API.KEY_UP:
		case Common.API.KEY_DOWN:
		case Common.API.KEY_RETURN:
		case Common.API.KEY_BLUE:	
		case 169:
			console.log("RETURN");
			event.preventDefault();
			
			if (this.status == "PAUSED") {
				this.handleStopKey();
			} else {
				if (this.playedFromPage == "GuiImagePlayer" && document.getElementById("guiButtonShade") != null) {
					document.getElementById("guiButtonShade").style.visibility = "hidden";
					document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility="";
				}
				//Hide the music player.
				document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
				document.getElementById("guiMusicPlayerDiv").style.bottom = "0";
				document.getElementById("Counter").style.visibility = "";
				GuiDisplay_MediaItems.adjustHeight();
				
				//Hide colour buttons if a slideshow is running.
				if (GuiImagePlayer.ImageViewer != null){
					GuiHelper.setControlButtons(null,null,null,null,null);
				}
				
				//Set Page GUI elements Correct & Set Focus
				if (this.selectedDivId != null) {
					if (this.selectedDivClass == "UNDEFINED") {
						document.getElementById(this.selectedDivId).className = document.getElementById(this.selectedDivId).className + " Selected";		
					} else {
						document.getElementById(this.selectedDivId).className = this.selectedDivClass;
					}
				}
				document.getElementById("body").onkeydown = document.getElementById(this.playedFromPage).onkeydown;
				if (this.playedFromPage == "GuiDisplay_MediaItems") {
					GuiDisplay_MediaItems.onFocus();
				}
			}
			break;
		case Common.API.KEY_EXIT:
			console.log ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiMusicPlayer.setclickHandlers = function() {
    document.getElementById("guiMusicPlayerShuffle").onclick = GuiMusicPlayer.handleShuffle;
    document.getElementById("guiMusicPlayerRepeat").onclick = GuiMusicPlayer.handleRepeat;
    document.getElementById("guiMusicPlayerPlay").onclick = GuiMusicPlayer.handlePlayKey;
    document.getElementById("guiMusicPlayerStop").onclick = GuiMusicPlayer.handleStopKey;
    document.getElementById("guiMusicPlayerPrevious").onclick = GuiMusicPlayer.handlePreviousKey;
    document.getElementById("guiMusicPlayerPause").onclick = GuiMusicPlayer.handlePauseKey;
    document.getElementById("guiMusicPlayerNext").onclick = GuiMusicPlayer.handleNextKey;
	document.getElementById("guiMusicPlayer_Info_ProgressBar").onclick = GuiMusicPlayer.handleSeek;
    
}

GuiMusicPlayer.handleSeek = function(e) {
	var elem = document.getElementById("guiPlayer_Info_ProgressBar");
	var left = elem.offsetLeft;
	var width = elem.offsetWidth;
	var seek = (e.pageX - left) / width;
	var hms = "";
	if (GuiMusicPlayer.shuffle == 'off') {
		hms = GuiMusicPlayer.queuedItems[GuiMusicPlayer.currentPlayingItem].duration;
	}
	else {
		hms = GuiMusicPlayer.shuffledItems[GuiMusicPlayer.currentPlayingItem].duration;
	}
	
	var a = hms.split(':'); // split it at the colons

	// minutes are worth 60 seconds. Hours are worth 60 minutes.
	var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
	GuiMusicPlayer.audioElem.currentTime = seek * totalseconds;
}

GuiMusicPlayer.toggleShow = function(show) {
	if (show) {
		GuiMainMenu.toggleMusic(false);
		document.getElementById("guiMusicPlayerDiv").style.bottom = "-60px";
		document.getElementById("guiMusicPlayerDiv").style.visibility = "";
		$('.guiMusicPlayerDiv').animate({
			bottom: 0
		}, 300, function() {
			//animate complete.
			GuiDisplay_MediaItems.adjustHeight();
		});
	}
	else {
		//Hide the music player.
		document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
		document.getElementById("guiMusicPlayerDiv").style.bottom = "0";
		document.getElementById("Counter").style.visibility = "";
		GuiDisplay_MediaItems.adjustHeight();
		
		GuiMainMenu.toggleMusic(GuiMusicPlayer.Status == "PLAYING" || GuiMusicPlayer.Status == "PAUSED");
	}
}

GuiMusicPlayer.handlePlayKey = function() {
	if (GuiMusicPlayer.Status != "PLAYING") {	
		
		if (GuiMusicPlayer.Status == "PAUSED") {
			GuiMusicPlayer.audioElem.play();
		} else {
			//Clear down any variables
			GuiMusicPlayer.currentTime = 0;
		    GuiMusicPlayer.updateTimeCount = 0;
		    
			//Calculate position in seconds
		    GuiMusicPlayer.audioElem.src = GuiMusicPlayer.videoURL;
		    GuiMusicPlayer.audioElem.play();
		}
		document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-active-29x37.png')";
		document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
		GuiMusicPlayer.Status = "PLAYING";
	}
}

GuiMusicPlayer.handlePauseKey = function() {
	GuiMusicPlayer.audioElem.pause();
	//Server.videoPaused(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].id,this.currentTime,"DirectStream");
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-active-32x37.png')";
	GuiMusicPlayer.Status = "PAUSED";
}

GuiMusicPlayer.stopPlayback = function() {
	//Reset everything
	GuiMusicPlayer.Status = "STOPPED";
	console.log (GuiMusicPlayer.currentPlayingItem);
	//Server.videoStopped(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].id,this.currentTime,"DirectStream");
	GuiMusicPlayer.showThemeId = null;
	GuiMusicPlayer.isThemeMusicPlaying = false;
	//this.currentPlayingItem = 0;
	GuiMusicPlayer.queuedItems.length = 0;
	GuiMusicPlayer.shuffledItems.length = 0;
    if (GuiMusicPlayer.audioElem != null) {
        GuiMusicPlayer.audioElem.pause();
    }
    
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
	document.getElementById("guiMusicPlayerStop").style.backgroundImage="url('images/musicplayer/stop-active-37x37.png')";
	setTimeout(function(){
		document.getElementById("guiMusicPlayerStop").style.backgroundImage="url('images/musicplayer/stop-37x37.png')";
	}, 400);
}

GuiMusicPlayer.handleStopKey = function() {
	console.log ("STOPPING PLAYBACK");
	GuiMusicPlayer.stopPlayback();
	GuiHelper.setControlButtons(0,0,0,null,0);
	GuiMusicPlayer.returnToPage();
}

GuiMusicPlayer.returnToPage = function() {
	//Reset NAVI - Works
	/*NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(Common.API.KEY_VOL_UP);
    pluginAPI.registKey(Common.API.KEY_VOL_DOWN);
    pluginAPI.registKey(Common.API.KEY_MUTE);*/
	
	
	//Set queued Items to 0
    this.isThemeMusicPlaying = false;
	this.queuedItems.length = 0;
	this.shuffledItems.length = 0;
	
    if (document.getElementById("guiMusicPlayerDiv").style.visibility == "") {
		document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
		document.getElementById("guiMusicPlayerDiv").style.bottom = "0";	
		GuiDisplay_MediaItems.adjustHeight();
    }
    
	//Set Page GUI elements Correct & Set Focus
	/*if (this.selectedDivId != null) {
		if (this.selectedDivClass == "UNDEFINED") {
			document.getElementById(this.selectedDivId).className = document.getElementById(this.selectedDivId).className + " Selected";		
		} else if (document.getElementById(this.selectedDivId) != null) {
			document.getElementById(this.selectedDivId).className = this.selectedDivClass;
		}
	}*/
	document.getElementById("body").onkeydown = document.getElementById(this.playedFromPage).onkeydown;
}

GuiMusicPlayer.handleNextKey = function() {
	
	//Stop Any Playback
	//Server.videoStopped(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,this.currentTime,"DirectStream");
	GuiMusicPlayer.audioElem.pause();
	GuiMusicPlayer.Status = "STOPPED";
		
	if (GuiMusicPlayer.repeat != 'one') {
		GuiMusicPlayer.currentPlayingItem++;
	}
	
	if (GuiMusicPlayer.queuedItems.length <= GuiMusicPlayer.currentPlayingItem &&
		GuiMusicPlayer.repeat == 'on') {
		GuiMusicPlayer.currentPlayingItem = 0;
	}
	
	if (GuiMusicPlayer.queuedItems.length <= GuiMusicPlayer.currentPlayingItem) {
		GuiMusicPlayer.returnToPage();
	} else {
		//Play Next Item
		if (GuiMusicPlayer.shuffle == 'off') {
			GuiMusicPlayer.videoURL = GuiMusicPlayer.queuedItems[GuiMusicPlayer.currentPlayingItem].contentUrl;
		}
		else {
			GuiMusicPlayer.videoURL = GuiMusicPlayer.shuffledItems[GuiMusicPlayer.currentPlayingItem].contentUrl;
		}
		console.log ("Next " + GuiMusicPlayer.videoURL);
		//Start Playback
		GuiMusicPlayer.handlePlayKey();
	}
	
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
	document.getElementById("guiMusicPlayerNext").style.backgroundImage="url('images/musicplayer/skip-next-active-36x37.png')";
	setTimeout(function(){
		document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-active-29x37.png')";
		document.getElementById("guiMusicPlayerNext").style.backgroundImage="url('images/musicplayer/skip-next-36x37.png')";
	}, 300);
}

GuiMusicPlayer.handlePreviousKey = function() {
	//Stop Any Playback
	var timeOfStoppedSong = Math.floor((GuiMusicPlayer.currentTime % 60000) / 1000);
		
	//Server.videoStopped(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,this.currentTime,"DirectStream");
	GuiMusicPlayer.audioElem.pause();
	GuiMusicPlayer.Status = "STOPPED";
		
	//If song over 5 seconds long, previous song returns to start of current song, else go back to previous
	GuiMusicPlayer.currentPlayingItem = (timeOfStoppedSong > 5 ) ? GuiMusicPlayer.currentPlayingItem : GuiMusicPlayer.currentPlayingItem-1;
		
	console.log ("Queue Length : " + GuiMusicPlayer.queuedItems.length);
	console.log ("Current Playing ID : " + GuiMusicPlayer.currentPlayingItem);
			
	if (GuiMusicPlayer.queuedItems.length <= GuiMusicPlayer.currentPlayingItem &&
		GuiMusicPlayer.repeat == 'on') {
		GuiMusicPlayer.currentPlayingItem = GuiMusicPlayer.queuedItems.length - 1;
	}
	
	if (GuiMusicPlayer.queuedItems.length <= GuiMusicPlayer.currentPlayingItem) {
		GuiMusicPlayer.returnToPage();
	} else {
		//Play Next Item
		if (GuiMusicPlayer.shuffle == 'off') {
			GuiMusicPlayer.videoURL = GuiMusicPlayer.queuedItems[GuiMusicPlayer.currentPlayingItem].contentUrl;
		}
		else {
			GuiMusicPlayer.videoURL = GuiMusicPlayer.shuffledItems[GuiMusicPlayer.currentPlayingItem].contentUrl;
		}
		console.log ("Next " + GuiMusicPlayer.videoURL);
		//Start Playback
		GuiMusicPlayer.handlePlayKey();
	}
	
	document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-29x37.png')";
	document.getElementById("guiMusicPlayerPause").style.backgroundImage="url('images/musicplayer/pause-32x37.png')";
	document.getElementById("guiMusicPlayerPrevious").style.backgroundImage="url('images/musicplayer/skip-previous-active-36x37.png')";
	setTimeout(function(){
		document.getElementById("guiMusicPlayerPlay").style.backgroundImage="url('images/musicplayer/play-active-29x37.png')";
		document.getElementById("guiMusicPlayerPrevious").style.backgroundImage="url('images/musicplayer/skip-previous-36x37.png')";
	}, 300);
}

GuiMusicPlayer.shuffleArray = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
	if (GuiMusicPlayer.currentPlayingItem == currentIndex) {
		GuiMusicPlayer.currentPlayingItem = randomIndex;
	}
	else if (GuiMusicPlayer.currentPlayingItem == randomIndex) {
		GuiMusicPlayer.currentPlayingItem = currentIndex;
	}
  }

  return array;
}

GuiMusicPlayer.handleShuffle = function() {
	if (GuiMusicPlayer.shuffle == 'on') {
		GuiMusicPlayer.shuffle = 'off';
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_off.png')";
	}
	else if (GuiMusicPlayer.shuffle == 'off') {
		GuiMusicPlayer.shuffleArray(GuiMusicPlayer.shuffledItems);
		GuiMusicPlayer.shuffle = 'on';
		document.getElementById("guiMusicPlayerShuffle").style.backgroundImage="url('images/musicplayer/shuffle_on.png')";
	}
	File.setUserProperty("shuffle", GuiMusicPlayer.shuffle);
	//this.updateSelectedItem();
}

GuiMusicPlayer.handleRepeat = function() {
	document.getElementById("guiMusicPlayerRepeat").className = "guiMusicPlayerRepeat";
	if (GuiMusicPlayer.repeat == 'on') {
		GuiMusicPlayer.repeat = 'one';
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_one.png')";
	}
	else if (GuiMusicPlayer.repeat == 'one') {
		GuiMusicPlayer.repeat = 'off';
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_off.png')";
	}
	else if (GuiMusicPlayer.repeat == 'off') {
		GuiMusicPlayer.repeat = 'on';
		document.getElementById("guiMusicPlayerRepeat").style.backgroundImage="url('images/musicplayer/repeat_on.png')";
	}
	File.setUserProperty("repeat", GuiMusicPlayer.repeat);
	//this.updateSelectedItem();
}

GuiMusicPlayer.handlePlaylistKey = function() {
	//Redo another day
	/*
	if (document.getElementById("guiMusicPlayerShowPlaylist").style.visibility == "hidden") {
		document.getElementById("guiMusicPlayerShowPlaylist").style.visibility = "";
	} else {
		document.getElementById("guiMusicPlayerShowPlaylist").style.visibility = "hidden";
	}
	
	document.getElementById("guiMusicPlayerShowPlaylistContent").innerHTML = "";
	for (var index = 0; index < this.queuedItems.length; index++) {
		document.getElementById("guiMusicPlayerShowPlaylistContent").innerHTML += this.queuedItems[index].title;
	}
	*/
}

//--------------------------------------------------------------------------------------------------

GuiMusicPlayer.handleOnRenderingComplete = function() {
	console.log ("File complete");
	GuiMusicPlayer.handleNextKey();
}

GuiMusicPlayer.handleError = function(e) {
    if (this.getAttribute("src") === "" &&
	      this.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
	    // MEDIA_ERR_SRC_NOT_SUPPORTED occurs
	    // when changing or initializing source during playback
	    // Do not treat this as an error
	    // this.src is not null string but baseURI ("index.html" path)
	    // Use the getAttribute() method to get the current source
    }
	else if (this.error && typeof this.error.code === "number") {
	    switch (this.error.code) {
	      case MediaError.MEDIA_ERR_ABORTED:
	        Player.OnConnectionFailed.call(PlayerEvtListener, e);
	        break;
	
	      case MediaError.MEDIA_ERR_ENCRYPTED:
	      case MediaError.MEDIA_ERR_DECODE:
	      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
	        Player.OnRenderError.call(Player, e);
	        break;
	
	      case MediaError.MEDIA_ERR_NETWORK:
	        Player.OnNetworkDisconnected.call(Player, e);
	        break;
	
	      default:
	        PlayerEvtListener.OnRenderError.call(Player, e);
	    }
    }
		
}

GuiMusicPlayer.setCurrentTime = function(){
	if (GuiMusicPlayer.Status == "PLAYING") {
		GuiMusicPlayer.currentTime = this.currentTime;
		GuiMusicPlayer.updateTimeCount++;
		
	
		//Update Server every 8 ticks
		if (GuiMusicPlayer.updateTimeCount == 8) {
			GuiMusicPlayer.updateTimeCount = 0;
			//Update Server
			//Server.videoPaused(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,this.currentTime,"DirectStream");
		}
		var hms = null;
		if (GuiMusicPlayer.shuffle == 'off') {
			hms = GuiMusicPlayer.queuedItems[GuiMusicPlayer.currentPlayingItem].duration;   // your input string
		}
		else {
			hms = GuiMusicPlayer.shuffledItems[GuiMusicPlayer.currentPlayingItem].duration;   // your input string
		}
		
		if (hms != null && hms != "") {
			var a = hms.split(':'); // split it at the colons

			// minutes are worth 60 seconds. Hours are worth 60 minutes.
			var totalseconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			document.getElementById("guiMusicPlayerTime").innerHTML = Support.convertTicksToTime(GuiMusicPlayer.currentTime * 1000, totalseconds * 1000);
			
			percentage = (100 * this.currentTime / (totalseconds));	
			document.getElementById("guiMusicPlayer_Info_ProgressBar_Current").style.width = percentage + "%";
		}
		else {
			document.getElementById("guiMusicPlayerTime").innerHTML = "Live";
		}
	}
}

GuiMusicPlayer.OnStreamInfoReady = function() {
	var playingTitle = "";
	var itemData = null;
	if (GuiMusicPlayer.shuffle == 'off') {
		itemData = GuiMusicPlayer.queuedItems[GuiMusicPlayer.currentPlayingItem];
	}
	else {
		itemData = GuiMusicPlayer.shuffledItems[GuiMusicPlayer.currentPlayingItem];
	}
	
	if (GuiMusicPlayer.isThemeMusicPlaying == false) {
		if (itemData.IndexNumber){
			if (itemData.IndexNumber < 10) {
				playingTitle = " - " + "0"+itemData.IndexNumber+" - ";
			} else {
				playingTitle = " - " + itemData.IndexNumber+" - ";
			}	
		}
		var songName = itemData.title;
		var title = "";
		if (itemData.Artists) {
			title += itemData.Artists + " ";
		}
		if (playingTitle) {
			title += playingTitle;
		}
		if (itemData.title) {
			title += itemData.title;
		}
		//Truncate long title.
		if (title.length > 67){
			title = title.substring(0,65) + "..."; 
		}
		
		document.getElementById("guiMusicPlayerTitle").innerHTML = title;
		document.getElementById("guiMusicPlayerAlbumArt").style.backgroundImage = "url(" + itemData.poster + ")";
	} else {
		document.getElementById("guiMusicPlayerTitle").innerHTML = "Theme Music";	
	}

	var totalseconds = Support.getSeconds(itemData.duration); 
	
	document.getElementById("guiMusicPlayerTime").innerHTML = Support.convertTicksToTime(this.currentTime, (totalseconds * 1000));
	
	//Playback Checkin
	//Server.videoStarted(this.queuedItems[this.currentPlayingItem].id,this.queuedItems[this.currentPlayingItem].MediaSources[0].id,"DirectStream");
	
    //Volume & Mute Control - Works!
	/*NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
    pluginAPI.unregistKey(Common.API.KEY_VOL_UP);
    pluginAPI.unregistKey(Common.API.KEY_VOL_DOWN);
    pluginAPI.unregistKey(Common.API.KEY_MUTE);*/
}

GuiMusicPlayer.stopOnAppExit = function() {
	if (this.audioElem != null) {
		this.audioElem.pause();
		this.audioElem = null;
	}		
}
