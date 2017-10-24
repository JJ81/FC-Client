
function getE(L) {
	return document.getElementById(L);
}

var timerid = 0;
function loadAquaAxPlugin() {
	$("html").append('<OBJECT CLASSID="clsid:81C08477-A103-4FDC-B7A6-953940EAD67F"  codebase="'+NPLAYER_SETUP_URL+'#version='+AX_VERSION+'" width="0" height="0" ID="AquaAxPlugin" ></OBJECT>');
	
	if (typeof AquaAxPlugin.InitAuth != "undefined"){
		return true;
	} else {
		timerid = setInterval("chkObj()", 1000);
	}
}

function chkObj() {
	var L = getE("AquaAxPlugin");
	if(L.object) {
		if(L.checkAquaAxVersion(AX_VERSION) == true) {
			clearInterval(timerid);
			location.reload();
		}
	}
}

function setAquaAxPlugin(url,param) {
	if (typeof AquaAxPlugin.InitAuth != "undefined"){
		AquaAxPlugin.authParam=param;
		AquaAxPlugin.InitAuth();	
		AquaAxPlugin.mediaURL=url;
		AquaAxPlugin.OpenMedia();
		return true;
	} else {
		return false;
	}
}

function setMegaSubtitle(fontName, fontSize, r, g, b, a, x, y, text) {
	player.setSubtitleFont(fontName, fontSize);
	player.setSubtitleColor(r, g, b, a);
	player.setSubtitlePosition(x, y);
	player.setSubtitleText(text);
}

var isDup=false;
function dupPlayerStop () {
	var msg = NPLAYER_DUP_MSG;
	player.stop();		
	setTimeout(function () {
		alert(msg); 
	}, 200);
	isDup = true;
};
function getPlayerDuration()
{
	var duration = player.getDuration();
	return (parseInt(duration*1000));
}

function getPlaybackRate()
{
	var playbackrate = player.getCurrentPlaybackRate();
	return (parseInt(playbackrate*1000));
}

function getCurrentPosition()
{
	var pos = player.getCurrentPlaybackTime();
	return (parseInt(pos*1000));
}