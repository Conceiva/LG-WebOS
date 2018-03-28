var File = {
		documentsObj : '',
		ServerEntry : null,
		UserEntry : null
};

File.getServerEntry = function() {
	return this.ServerEntry;
};

File.setServerEntry = function(serverEntry) {
	this.ServerEntry = serverEntry;
};

File.getUserEntry = function() {
	return this.UserEntry;
};

File.setUserEntry = function(userEntry) {
	this.UserEntry = userEntry;
};

File.deleteOldSettingsFile = function() {
	var fileSystemObj = new FileSystem();
	fileSystemObj.deleteCommonFile(curWidget.id + '/MEZZMO_Settings.xml');
};

File.deleteSettingsFile = function() {
	localStorage.setItem('MEZZMO_Settings.json', null); 
};

File.loadFile = function() {
	var strResult = localStorage.getItem('MEZZMO_Settings.json');
	if (strResult === null) {
		strResult = '{"Version":"'+Main.getVersion()+'","Servers":[],"TV":{}}';
		localStorage.setItem('MEZZMO_Settings.json', strResult); 
	}
	
	return strResult;
};

File.checkVersion = function(fileContent) {
	if (fileContent.Version === undefined) {
		return "Undefined";
	} else {
		return fileContent.Version;
	}
};

File.saveServerToFile = function(url, browseURL, iconURL, friendlyName) {
	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json'));
	
	var serverExists = false;
	for (var index = 0; index < fileJson.Servers.length; index++) {
		if (url == fileJson.Servers[index].Id) {
			this.ServerEntry = index;
			serverExists = true;
			console.log ("Server already exists in file - not adding - Server Entry: " + this.ServerEntry);
		}
	}
	
	if (serverExists == false) {
		this.ServerEntry = fileJson.Servers.length;
		fileJson.Servers[fileJson.Servers.length] = {"Id":url,"Name":friendlyName,"Path":browseURL, "Icon":iconURL,"Default":false,"Users":[]};
		localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(fileJson)); 
		console.log ("Server added to file - Server Entry: " + this.ServerEntry);
	}	
};

File.setDefaultServer = function (defaultIndex) {
	var fileJson = JSON.parse(File.loadFile()); 
	for (var index = 0; index < fileJson.Servers.length; index++) {
		if (fileJson.Servers[defaultIndex].Id == fileJson.Servers[index].Id ) {
			fileJson.Servers[index].Default = true;
		} else {
			fileJson.Servers[index].Default = false;
		}
	}
	

	localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(fileJson)); 
	
	GuiNotifications.setNotification(fileJson.Servers[defaultIndex].Name + " is now your default Server and will be logged in autiomatically from now on.","Default Server Changed",true);
};

File.deleteServer = function (index) {

	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json')); 

	fileJson.Servers.splice(index);
	

	localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(fileJson)); 
	
	if (fileJson.Servers.length == 0) {
		GuiPage_NewServer.start();
	} else {
		GuiPage_Servers.start();
	}
};

File.updateUserSettings = function (altered) {

	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json')); 
	fileJson.Servers[this.ServerEntry].Users[this.UserEntry] = altered;
	

	localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(fileJson)); 

};


File.updateServerSettings = function (altered) {
	
	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json')); 

	fileJson.Servers[this.ServerEntry] = altered;

	localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(fileJson)); 

};

File.writeAll = function (toWrite) {

	localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(toWrite)); 

};

//---------------------------------------------------------------------------------------------------------------------------------
//-  GET FUNCTIONS
//---------------------------------------------------------------------------------------------------------------------------------

File.getUserProperty = function(property) {

	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json')); 

	return fileJson.Servers[this.ServerEntry][property];	
};

File.getTVProperty = function(property) {

	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json')); 

	if (fileJson.TV === undefined) {
		fileJson.TV = {};
		stream.write (fileJson);
	}
	
	if (fileJson.TV[property] === undefined) {
		//Get System Default
		
	} 
	return fileJson.TV[property];

	
};

//---------------------------------------------------------------------------------------------------------------------------------
//-  SET FUNCTIONS
//---------------------------------------------------------------------------------------------------------------------------------

File.setUserProperty = function(property,value) {

	var fileJson = JSON.parse(localStorage.getItem('MEZZMO_Settings.json')); 	
	
	fileJson.Servers[this.ServerEntry][property] = value;

	localStorage.setItem('MEZZMO_Settings.json', JSON.stringify(fileJson)); 

	
	return 	

};