// require this script before your document is done loading
;(function () {
  
  var isDroid = navigator.userAgent.match(/Android/)
  var isiOS = navigator.userAgent.match(/(iPhone|iPod|iPad)/)
  var droidScripts = [
    "script/cordova-android.js",
    "script/android-utils.js",
    "script/cdv-plugin-childbrowser-android.js",
    "script/cdv-plugin-datepicker.js",
    "script/cdv-plugin-statusbarnotification.js",
    "script/cdv-plugin-gcm.js"
  ]
  var iosScripts = [
    "script/cordova-ios.js",
    "script/cdv-plugin-pushnotification.js",
    "script/cdv-plugin-childbrowser-ios.js"
  ]
  
  if (isDroid) droidScripts.forEach(loadScript)
  if (isiOS) iosScripts.forEach(loadScript)

  function loadScript(src) {
    var line = '<script type="text/javascript" charset="utf-8" src="' + src + '"></script>';
    document.writeln(line);
  }
})();