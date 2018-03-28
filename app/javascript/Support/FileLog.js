var FileLog = {
};

FileLog.deleteFile = function() {
	/*tizen.filesystem.resolve("wgt-private", function(dir2) {
        dir2.deleteFile("wgt-private/log.txt");
    });*/
}

FileLog.loadFile = function(returnContents) {
	/*var str;
	tizen.filesystem.resolve("wgt-private", function(dir ){
	  dir.resolve("wgt-private/log.txt").openStream("rw",
	    function(stream) {
			var strLine = "";
			var arrayFile = new Array();
			while ((strLine=stream.read(255))) {
				arrayFile.push(strLine);
			}

	        stream.close();
	        
	        returnContents(arrayFile);
	
	  });
	});*/
};

FileLog.write = function (toWrite,noDate) {
	/*console.log('FileLog.write');
	var writeDate = (noDate == undefined) ? true : false;
	toWrite = (writeDate == true) ? FileLog.getTimeStamp() + " " + toWrite : toWrite;
	console.log(toWrite);
	tizen.filesystem.resolve("wgt-private", function(dir ){
		  dir.resolve("wgt-private/log.txt").openStream("rw",
		    function(stream) {
				stream.write(toWrite);
		        stream.close();
		        
		  });
		});*/
}

FileLog.empty = function () {
	var fileSystemObj = new FileSystem();
	var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Log.txt', 'w');
	if (openWrite) {
		fileSystemObj.closeCommonFile(openWrite); 
	}
}

FileLog.getTimeStamp = function () {
	var date = new Date();
	var day = (date.getDate() + 1 < 10) ? "0" + (date.getDate() + 1) : date.getDate() + 1;
	var month = (date.getMonth() + 1 < 10) ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
	var year = date.getFullYear();
	
	var h=date.getHours();
	var offset = File.getTVProperty("ClockOffset");
	h = h+offset;
	if (h<0) {h = h + 24;};
	if (h>23){h = h - 24;};
	if (h<10) {h = "0" + h;};
	var m=date.getMinutes(); 
	if (m<10) {m = "0" + m;};
	return day + "/" + month + "/" + year + " " + h+':'+m;
}