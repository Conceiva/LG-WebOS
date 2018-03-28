
	
var Main =
{
		version : "v0.0.2",
		requiredServerVersion : "5.2.0.0",
		requiredDevServerVersion : "3.0.5507.2131",
		
		//TV Series Version
		modelYear : null,
		width : 1920,
		height : 1080,
		backdropWidth : 1920,
		backdropHeight : 1080,
		posterWidth : 265,
		posterHeight : 267,
		seriesPosterWidth : 180,
		seriesPosterHeight : 270,
		seriesPosterLargeWidth : 235,
		seriesPosterLargeHeight : 350,
		
		forceDeleteSettings : false,
		highlightColour : 1,
		
		enableMusic : true,
		enableLiveTV : true,
		enableCollections : true,
		enableChannels : true,
		enableImageCache : true,
		
		enableScreensaver : true,
		isScreensaverRunning : false,
};

Main.getModelYear = function() {
	return this.modelYear;
};

Main.isMusicEnabled = function() {
	return this.enableMusic;
};

Main.isLiveTVEnabled = function() {
	return this.enableLiveTV;
};

Main.isCollectionsEnabled = function() {
	return this.enableCollections;
};

Main.isChannelsEnabled = function() {
	return this.enableChannels;
};

Main.isScreensaverEnabled = function() {
	return this.enableScreensaver;
};

Main.isImageCaching = function() {
	return this.enableImageCache;
};

Main.getRequiredServerVersion = function() {
	return this.requiredServerVersion;
};

Main.getVersion = function() {
	return this.version;
};

Main.getIsScreensaverRunning = function() {
	return this.isScreensaverRunning;
};

Main.setIsScreensaverRunning = function() {
	if (this.isScreensaverRunning == false) {
		this.isScreensaverRunning = true;
	} else {
		this.isScreensaverRunning = false;
	}
};

Main.setOnScreenSaver = function() {
	try {
		  // ScreenSaver ON
		  var screenState = webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON;

		  var value = webapis.appcommon.setScreenSaver(screenState, onsuccess, onerror);
		} catch (error) {
		  console.log(" error code = " + error.code);
		}	
};

Main.deleteCommonFile = function(file) {
	 /*tizen.filesystem.resolve("wgt-private", function(dir2) {
	        dir2.deleteFile(file);
	    });*/
};

Main.onLoad = function()
{	
	//Support.removeSplashScreen();
	//Setup Logging
	//FileLog.loadFile(false); // doesn't return contents, done to ensure file exists
	//FileLog.write("---------------------------------------------------------------------",true);
	//FileLog.write("Mezzmo Application Started");
	
	//Initialize key defines
	Common.API.TVKeyValue();
	
	if (Main.isImageCaching()) {
		Main.deleteCommonFile('wgt-private/cache.json');
		Support.imageCachejson = JSON.parse('{"Images":[]}');
	}
	
	document.getElementById("splashscreen_version").innerHTML = Main.version;
	
	//Turn ON screensaver
	this.setOnScreenSaver();
	//FileLog.write("Screensaver enabled.");
	//Support.clock();
	//widgetAPI.sendReadyEvent();
	window.onShow = Main.initKeys();	

	//Set DeviceID & Device Name
	//var NNaviPlugin = document.getElementById("pluginObjectNNavi");
	//var pluginNetwork = document.getElementById("pluginObjectNetwork");
	//var pluginTV = document.getElementById("pluginObjectTV");
	//FileLog.write("Plugins initialised.");


    //Load Settings File - Check if file needs to be deleted due to development
    var fileJson = JSON.parse(File.loadFile()); 
    var version = File.checkVersion(fileJson);
    if (version == "Undefined" ) {
    	//Delete Settings file and reload
    	File.deleteSettingsFile();
    	fileJson = JSON.parse(File.loadFile());
    } else if (version != this.version) {
    	if (this.forceDeleteSettings == true) {
    		//Delete Settings file and reload
    		File.deleteSettingsFile();
	    	fileJson = JSON.parse(File.loadFile());
    	} else {
    		//Update version in settings file to current version
    		fileJson.Version = this.version;
    	} 	File.writeAll(fileJson);
    }

    
    //Check if Server exists
    if (fileJson.Servers.length > 1) {
    	//If no default show user Servers page (Can set default on that page)
    	var foundDefault = false;
    	for (var index = 0; index < fileJson.Servers.length; index++) {
    		if (fileJson.Servers[index].Default == true) {
    			foundDefault = true;
    			FileLog.write("Default server found.");
    			File.setServerEntry(index);
    			Server.testConnectionSettings(fileJson.Servers[index].Path,true);    				
    			break;
    		}
    	}
    	if (foundDefault == false) {
    		FileLog.write("Multiple servers defined. Loading the select server page.");
    		GuiPage_Servers.start();
    	}
    } else if (fileJson.Servers.length == 1) {
    	//If 1 server auto login with that
    	FileLog.write("Mezzmo server name found in settings. Auto-connecting.");
    	File.setServerEntry(0);
    	Server.testConnectionSettings(fileJson.Servers[0].Path,true);
    } else {
    	//No Server Defined - Load GuiPage_IP
    	FileLog.write("No server defined. Loading the new server page.");
    	GuiPage_Servers.start();
    }

};

Main.initKeys = function() {
	//pluginAPI.registKey(Common.API.KEY_TOOLS);
	//pluginAPI.registKey(Common.API.KEY_3D); 
	FileLog.write("Key handlers initialised.");
};

Main.onUnload = function()
{
	//Write Cache to disk
	ImageCache.writeAll(Support.imageCachejson);
	Support.screensaverOff();
	GuiImagePlayer.kill();
	GuiMusicPlayer.stopOnAppExit();
	GuiPlayer.stopOnAppExit();
	//pluginAPI.unregistKey(Common.API.KEY_TOOLS);
	//pluginAPI.unregistKey(Common.API.KEY_3D);
};
