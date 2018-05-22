

var Discover = {

};

/*
 * translate text string to arryed buffer
 */
Discover.t2ab = function (str /* String */)
{
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++)
    {
        view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
}

/*
 * translate arrayed buffer to text string
 */
Discover.ab2t = function (buffer /* ArrayBuffer */)
{
    var arr = new Int8Array(buffer);
    var str = "";
    for(var i = 0, l = arr.length; i < l; i++)
    {
        str += String.fromCharCode.call(this, arr[i]);
    }
    return str;
}

/*
 * This function will be called when upd packet is recieved
 */
Discover.recieveData = function(info)
{
    var data = ab2t(info.data);

    var dt = new Date();
    var tmp = dt + "<br>";
    tmp += data.replace(/"\r\n"/g, "<br>") + "<br><br>";
    var location = /Location:(.+?)\r\n/i.exec(data)[1];
    tmp += "<br>" + location + "<br>";
    
    Discover.getDesc(location);

    console.log(tmp);

};

Discover.getDesc = function(url)
{
    var xhr = new XMLHttpRequest();
     xhr.open("GET", url, true);
     xhr.setRequestHeader('accept', '*/*');
     xhr.onreadystatechange = function () {
         if (xhr.readyState == 4 && xhr.status == 200) {
             // do something with response
             console.log(xhr.responseText);
             var xml = xhr.responseText;
             var iconURL = "";
             var iconSize = 0;
             var controlURL = "";
             xmlDoc = $.parseXML( xml );
              $xml = $( xmlDoc );
              $friendlyName = $xml.find( "friendlyName" );
			  $UDN = $xml.find( "UDN" );
              $xml.find("service").each(function() {
                $id = $(this).find("serviceType");
                if ($id.text() == "urn:schemas-upnp-org:service:ContentDirectory:1") {
                    controlURL = $(this).find("controlURL").text();
                }
              });
              
              $xml.find("icon").each(function() {
                var size = parseInt($(this).find("width").text());
                if (size > iconSize) {
                    iconURL = $(this).find("url").text();
                    iconSize = size;
                }
              });
              
    
            if (iconURL.indexOf("/") === 0) {
                iconURL = /(http:\/\/.+?)\//.exec(url)[1] + iconURL;
           }
           else {
                iconURL = /(http:\/\/.+)\//.exec(url)[1] + "/" + iconURL;
           }
    
           /*
           var browseURL = "";
           if (controlURL.indexOf("/") === 0) {
                browseURL = /(http:\/\/.+?)\//.exec(url)[1] + controlURL;
           }
           else {
                browseURL = /(http:\/\/.+)\//.exec(url)[1] + "/" + controlURL;
           }
		   */
		   if (iconURL == "") {
			    iconURL = "images/server.png";
		   }
           GuiDisplay_Servers.AddDevice({'id':$UDN.text(), 'name':$friendlyName.text(), 'ipAddress':url, 'iconUrl':iconURL });
           saveServers();
         }
    };
    xhr.send();
}


/*
 * This function will be called when "SSDP Start" button is pushed.
 */
Discover.ssdpStart = function()
{
    
    // M-Search packed w/ "ssdp:all"
    var MSearchAll = "M-SEARCH * HTTP/1.1\r\n" +
        "ST: urn:schemas-upnp-org:device:MediaServer:1\r\n" +
        "MAN: \"ssdp:discover\"\r\n" +
        "HOST: 239.255.255.250:1900\r\n" +
        "MX: 10\r\n\r\n";
    // chrome socket
    var socket = chrome.sockets.udp;
    // SSDP multicast address
    var SSDPMulticastAddress = "239.255.255.250";
    // SSDP multicast port
    var SSDPMulticastPort = 1900;
    // socket id
    var sid;

    // create udp socket
    socket.create(function(socketInfo)
    {
        sid = socketInfo.socketId;
        console.log("socket id: " + sid);
        socket.bind(sid, "0.0.0.0", 0, function(res)
        {
            if(res !== 0) {
                throw('cannot bind socket');
                return -1;
            }

            // recieve data
            chrome.sockets.udp.onReceive.addListener(Discover.recieveData);

            // Send SSDP Search x 2
            var buffer = t2ab(MSearchAll);
            for(var i = 0; i < 2; i++)
            {
                socket.send(sid, buffer, SSDPMulticastAddress, SSDPMulticastPort, function(e)
                {
                    if(e.bytesWritten < 0) {
                        throw("an Error occured while sending M-SEARCH : "+e.bytesWritten);
                    }
                });
            }
        });
    });
};
