var WaveSurfer={defaultParams:{height:128,waveColor:"#999",progressColor:"#555",cursorColor:"#333",cursorWidth:1,skipLength:2,minPxPerSec:20,pixelRatio:window.devicePixelRatio||screen.deviceXDPI/screen.logicalXDPI,fillParent:!0,scrollParent:!1,hideScrollbar:!1,normalize:!1,audioContext:null,container:null,dragSelection:!0,loopSelection:!0,audioRate:1,interact:!0,splitChannels:!1,mediaContainer:null,mediaControls:!1,renderer:"Canvas",backend:"WebAudio",mediaType:"audio",autoCenter:!0},init:function(a){this.params=
WaveSurfer.util.extend({},this.defaultParams,a);this.container="string"==typeof a.container?document.querySelector(this.params.container):this.params.container;if(!this.container)throw Error("Container element not found");this.mediaContainer=null==this.params.mediaContainer?this.container:"string"==typeof this.params.mediaContainer?document.querySelector(this.params.mediaContainer):this.params.mediaContainer;if(!this.mediaContainer)throw Error("Media Container element not found");this.savedVolume=
0;this.isMuted=!1;this.tmpEvents=[];this.currentAjax=null;this.createDrawer();this.createBackend();this.skipArrayBuffer=this.isDestroyed=!1},setSkipArrayBuffer:function(a){this.skipArrayBuffer=a},createDrawer:function(){var a=this;this.drawer=Object.create(WaveSurfer.Drawer[this.params.renderer]);this.drawer.init(this.container,this.params);this.drawer.on("redraw",function(){a.drawBuffer();a.drawer.progress(a.backend.getPlayedPercents())});this.drawer.on("click",function(b,c){setTimeout(function(){a.seekTo(c)},
0)});this.drawer.on("scroll",function(b){a.fireEvent("scroll",b)});this.drawer.on("waveComplete",function(b){a.fireEvent("waveComplete",b)})},createBackend:function(){var a=this;this.backend&&this.backend.destroy();"AudioElement"==this.params.backend&&(this.params.backend="MediaElement");"WebAudio"!=this.params.backend||WaveSurfer.WebAudio.supportsWebAudio()||(this.params.backend="MediaElement");this.backend=Object.create(WaveSurfer[this.params.backend]);this.backend.init(this.params);this.backend.on("finish",
function(){a.fireEvent("finish")});this.backend.on("play",function(){a.fireEvent("play")});this.backend.on("pause",function(){a.fireEvent("pause")});this.backend.on("audioprocess",function(b){a.drawer.progress(a.backend.getPlayedPercents());a.fireEvent("audioprocess",b)})},getDuration:function(){return this.backend.getDuration()},getCurrentTime:function(){return this.backend.getCurrentTime()},play:function(a,b){this.fireEvent("interaction",this.play.bind(this,a,b));this.backend.play(a,b)},pause:function(){this.backend.pause()},
playPause:function(){this.backend.isPaused()?this.play():this.pause()},isPlaying:function(){return!this.backend.isPaused()},skipBackward:function(a){this.skip(-a||-this.params.skipLength)},skipForward:function(a){this.skip(a||this.params.skipLength)},skip:function(a){var b=this.getCurrentTime()||0,c=this.getDuration()||1;b=Math.max(0,Math.min(c,b+(a||0)));this.seekAndCenter(b/c)},seekAndCenter:function(a){this.seekTo(a);this.drawer.recenter(a)},seekTo:function(a){this.fireEvent("interaction",this.seekTo.bind(this,
a));var b=this.backend.isPaused(),c=this.params.scrollParent;b&&(this.params.scrollParent=!1);this.backend.seekTo(a*this.getDuration());this.drawer.progress(this.backend.getPlayedPercents());b||(this.backend.pause(),this.backend.play());this.params.scrollParent=c;this.fireEvent("seek",a)},stop:function(){this.pause();this.seekTo(0);this.drawer.progress(0)},setVolume:function(a){this.backend.setVolume(a)},setPlaybackRate:function(a){this.backend.setPlaybackRate(a)},toggleMute:function(){this.isMuted?
(this.backend.setVolume(this.savedVolume),this.isMuted=!1):(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0)},toggleScroll:function(){this.params.scrollParent=!this.params.scrollParent;this.drawBuffer()},toggleInteraction:function(){this.params.interact=!this.params.interact},drawBuffer:function(){var a=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio),b=this.drawer.getWidth(),c=a;this.params.fillParent&&(!this.params.scrollParent||a<
b)&&(c=b);a=this.backend.getPeaks(c);this.drawer.drawPeaks(a,c);this.fireEvent("redraw",a,c)},zoom:function(a){this.params.minPxPerSec=a;this.params.scrollParent=!0;this.drawBuffer();this.drawer.progress(this.backend.getPlayedPercents());this.drawer.recenter(this.getCurrentTime()/this.getDuration());this.fireEvent("zoom",a)},loadArrayBuffer:function(a){this.decodeArrayBuffer(a,function(a){this.isDestroyed||this.loadDecodedBuffer(a)}.bind(this))},loadDecodedBuffer:function(a){this.backend.load(a);
this.drawBuffer();this.fireEvent("ready")},loadBlob:function(a){var b=this,c=new FileReader;c.addEventListener("progress",function(a){b.onProgress(a)});c.addEventListener("load",function(a){b.loadArrayBuffer(a.target.result)});c.addEventListener("error",function(){b.fireEvent("error","Error reading file")});c.readAsArrayBuffer(a);this.empty()},load:function(a,b,c){"undefined"==typeof c&&this.empty();switch(this.params.backend){case "WebAudio":return this.loadBuffer(a,b);case "MediaElement":return this.loadMediaElement(a,
b)}},loadBuffer:function(a,b){var c=function(b){b&&this.tmpEvents.push(this.once("ready",b));return this.getArrayBuffer(a,this.loadArrayBuffer.bind(this))}.bind(this);if(b)this.backend.setPeaks(b),this.drawBuffer(),this.tmpEvents.push(this.once("interaction",c));else return c()},loadMediaElement:function(a,b){var c=a;"string"===typeof a?this.backend.load(c,this.mediaContainer,b):(this.backend.loadElt(a,b),c=a.src);this.tmpEvents.push(this.backend.once("canplay",function(){this.drawBuffer();this.fireEvent("ready")}.bind(this)),
this.backend.once("error",function(a){this.fireEvent("error",a)}.bind(this)));b?this.backend.setPeaks(b):this.backend.supportsWebAudio()&&!this.skipArrayBuffer&&this.getArrayBuffer(c,function(a){this.decodeArrayBuffer(a,function(a){this.backend.buffer=a;this.drawBuffer();this.fireEvent("waveform_ME_noPeaks")}.bind(this))}.bind(this));this.skipArrayBuffer=!1},_getArrayBuffer:function(a){this.getArrayBuffer(a,function(a){this.decodeArrayBuffer(a,function(a){this.backend.buffer=a;this.drawBuffer();this.fireEvent("waveform_ME_noPeaks")}.bind(this))}.bind(this))},
decodeArrayBuffer:function(a,b){this.arraybuffer=a;this.backend.decodeArrayBuffer(a,function(c){this.isDestroyed||this.arraybuffer!=a||(b(c),this.arraybuffer=null)}.bind(this),this.fireEvent.bind(this,"error","Error decoding audiobuffer"))},getArrayBuffer:function(a,b){var c=this,d=WaveSurfer.util.ajax({url:a,responseType:"arraybuffer"});this.currentAjax=d;this.tmpEvents.push(d.on("progress",function(a){c.onProgress(a)}),d.on("success",function(a,d){b(a);c.currentAjax=null}),d.on("error",function(a){c.fireEvent("error",
"XHR error: "+a.target.statusText);c.currentAjax=null}));return d},onProgress:function(a){this.fireEvent("loading",Math.round(100*(a.lengthComputable?a.loaded/a.total:a.loaded/(a.loaded+1E6))),a.target)},exportPCM:function(a,b,c){b=b||1E4;c=c||!1;a=this.backend.getPeaks(a||1024,b);a=[].map.call(a,function(a){return Math.round(a*b)/b});a=JSON.stringify(a);c||window.open("data:application/json;charset=utf-8,"+encodeURIComponent(a));return a},exportImage:function(a,b){a||(a="image/png");b||(b=1);return this.drawer.getImage(a,
b)},cancelAjax:function(){this.currentAjax&&(this.currentAjax.xhr.abort(),this.currentAjax=null)},clearTmpEvents:function(){this.tmpEvents.forEach(function(a){a.un()});this.tmpEvents=[]},empty:function(){this.backend.isPaused()||(this.stop(),this.backend.disconnectSource());this.cancelAjax();this.clearTmpEvents();this.drawer.progress(0);this.drawer.setWidth(0);this.drawer.drawPeaks({length:this.drawer.getWidth()},0)},destroy:function(){this.fireEvent("destroy");this.cancelAjax();this.clearTmpEvents();
this.unAll();this.backend.destroy();this.drawer.destroy();this.isDestroyed=!0},create:function(a){var b=Object.create(WaveSurfer);b.init(a);return b},util:{extend:function(a){Array.prototype.slice.call(arguments,1).forEach(function(b){Object.keys(b).forEach(function(c){a[c]=b[c]})});return a},min:function(a){var b=Infinity,c;for(c in a)a[c]<b&&(b=a[c]);return b},max:function(a){var b=-Infinity,c;for(c in a)a[c]>b&&(b=a[c]);return b},getId:function(){return"wavesurfer_"+Math.random().toString(32).substring(2)},
ajax:function(a){var b=Object.create(WaveSurfer.Observer),c=new XMLHttpRequest,d=!1;c.open(a.method||"GET",a.url,!0);c.responseType=a.responseType||"json";c.addEventListener("progress",function(a){b.fireEvent("progress",a);a.lengthComputable&&a.loaded==a.total&&(d=!0)});c.addEventListener("load",function(a){d||b.fireEvent("progress",a);b.fireEvent("load",a);200==c.status||206==c.status?b.fireEvent("success",c.response,a):b.fireEvent("error",a)});c.addEventListener("error",function(a){b.fireEvent("error",
a)});c.send();b.xhr=c;return b}},Observer:{on:function(a,b){this.handlers||(this.handlers={});var c=this.handlers[a];c||(c=this.handlers[a]=[]);c.push(b);return{name:a,callback:b,un:this.un.bind(this,a,b)}},un:function(a,b){if(this.handlers){var c=this.handlers[a];if(c)if(b)for(var d=c.length-1;0<=d;d--)c[d]==b&&c.splice(d,1);else c.length=0}},unAll:function(){this.handlers=null},once:function(a,b){var c=this,d=function(){b.apply(this,arguments);setTimeout(function(){c.un(a,d)},0)};return this.on(a,
d)},fireEvent:function(a){if(this.handlers){var b=this.handlers[a],c=Array.prototype.slice.call(arguments,1);b&&b.forEach(function(a){a.apply(null,c)})}}}};WaveSurfer.util.extend(WaveSurfer,WaveSurfer.Observer);"use strict";
WaveSurfer.WebAudio={scriptBufferSize:256,PLAYING_STATE:0,PAUSED_STATE:1,FINISHED_STATE:2,supportsWebAudio:function(){return!(!window.AudioContext&&!window.webkitAudioContext)},getAudioContext:function(){WaveSurfer.WebAudio.audioContext||(WaveSurfer.WebAudio.audioContext=new (window.AudioContext||window.webkitAudioContext));return WaveSurfer.WebAudio.audioContext},getOfflineAudioContext:function(a){WaveSurfer.WebAudio.offlineAudioContext||(WaveSurfer.WebAudio.offlineAudioContext=new (window.OfflineAudioContext||
window.webkitOfflineAudioContext)(1,2,a));return WaveSurfer.WebAudio.offlineAudioContext},init:function(a){this.params=a;this.ac=a.audioContext||this.getAudioContext();this.lastPlay=this.ac.currentTime;this.startPosition=0;this.scheduledPause=null;this.states=[Object.create(WaveSurfer.WebAudio.state.playing),Object.create(WaveSurfer.WebAudio.state.paused),Object.create(WaveSurfer.WebAudio.state.finished)];this.createVolumeNode();this.createScriptNode();this.createAnalyserNode();this.setState(this.PAUSED_STATE);
this.setPlaybackRate(this.params.audioRate)},disconnectFilters:function(){this.filters&&(this.filters.forEach(function(a){a&&a.disconnect()}),this.filters=null,this.analyser.connect(this.gainNode))},setState:function(a){this.state!==this.states[a]&&(this.state=this.states[a],this.state.init.call(this))},setFilter:function(){this.setFilters([].slice.call(arguments))},setFilters:function(a){this.disconnectFilters();a&&a.length&&(this.filters=a,this.analyser.disconnect(),a.reduce(function(a,c){a.connect(c);
return c},this.analyser).connect(this.gainNode))},createScriptNode:function(){this.scriptNode=this.ac.createScriptProcessor?this.ac.createScriptProcessor(this.scriptBufferSize):this.ac.createJavaScriptNode(this.scriptBufferSize);this.scriptNode.connect(this.ac.destination)},addOnAudioProcess:function(){var a=this;this.scriptNode.onaudioprocess=function(){var b=a.getCurrentTime();b>=a.getDuration()?(a.setState(a.FINISHED_STATE),a.fireEvent("pause")):b>=a.scheduledPause?a.pause():a.state===a.states[a.PLAYING_STATE]&&
a.fireEvent("audioprocess",b)}},removeOnAudioProcess:function(){this.scriptNode.onaudioprocess=null},createAnalyserNode:function(){this.analyser=this.ac.createAnalyser();this.analyser.connect(this.gainNode)},createVolumeNode:function(){this.gainNode=this.ac.createGain?this.ac.createGain():this.ac.createGainNode();this.gainNode.connect(this.ac.destination)},setVolume:function(a){this.gainNode.gain.value=a},getVolume:function(){return this.gainNode.gain.value},decodeArrayBuffer:function(a,b,c){this.offlineAc||
(this.offlineAc=this.getOfflineAudioContext(this.ac?this.ac.sampleRate:44100));this.offlineAc.decodeAudioData(a,function(a){b(a)}.bind(this),c)},setPeaks:function(a){this.peaks=a},getPeaks:function(a){if(this.peaks)return this.peaks;for(var b=this.buffer.length/a,c=~~(b/10)||1,d=this.buffer.numberOfChannels,f=[],e=[],g=0;g<d;g++)for(var k=f[g]=[],m=this.buffer.getChannelData(g),h=0;h<a;h++){for(var l=~~(h*b),q=~~(l+b),n=0,p=0;l<q;l+=c){var r=m[l];r>p&&(p=r);r<n&&(n=r)}k[2*h]=p;k[2*h+1]=n;if(0==g||
p>e[2*h])e[2*h]=p;if(0==g||n<e[2*h+1])e[2*h+1]=n}return this.params.splitChannels?f:e},getPlayedPercents:function(){return this.state.getPlayedPercents.call(this)},disconnectSource:function(){this.source&&this.source.disconnect()},destroy:function(){this.isPaused()||this.pause();this.unAll();this.buffer=null;this.disconnectFilters();this.disconnectSource();this.gainNode.disconnect();this.scriptNode.disconnect();this.analyser.disconnect()},load:function(a){this.startPosition=0;this.lastPlay=this.ac.currentTime;
this.buffer=a;this.createSource()},createSource:function(){this.disconnectSource();this.source=this.ac.createBufferSource();this.source.start=this.source.start||this.source.noteGrainOn;this.source.stop=this.source.stop||this.source.noteOff;this.source.playbackRate.value=this.playbackRate;this.source.buffer=this.buffer;this.source.connect(this.analyser)},isPaused:function(){return this.state!==this.states[this.PLAYING_STATE]},getDuration:function(){return this.buffer?this.buffer.duration:0},seekTo:function(a,
b){if(this.buffer)return this.scheduledPause=null,null==a&&(a=this.getCurrentTime(),a>=this.getDuration()&&(a=0)),null==b&&(b=this.getDuration()),this.startPosition=a,this.lastPlay=this.ac.currentTime,this.state===this.states[this.FINISHED_STATE]&&this.setState(this.PAUSED_STATE),{start:a,end:b}},getPlayedTime:function(){return(this.ac.currentTime-this.lastPlay)*this.playbackRate},play:function(a,b){if(this.buffer){this.createSource();var c=this.seekTo(a,b);a=c.start;this.scheduledPause=b=c.end;this.source.start(0,
a,b-a);this.setState(this.PLAYING_STATE);this.fireEvent("play")}},pause:function(){this.scheduledPause=null;this.startPosition+=this.getPlayedTime();this.source&&this.source.stop(0);this.setState(this.PAUSED_STATE);this.fireEvent("pause")},getCurrentTime:function(){return this.state.getCurrentTime.call(this)},setPlaybackRate:function(a){a=a||1;this.isPaused()?this.playbackRate=a:(this.pause(),this.playbackRate=a,this.play())}};WaveSurfer.WebAudio.state={};
WaveSurfer.WebAudio.state.playing={init:function(){this.addOnAudioProcess()},getPlayedPercents:function(){var a=this.getDuration();return this.getCurrentTime()/a||0},getCurrentTime:function(){return this.startPosition+this.getPlayedTime()}};WaveSurfer.WebAudio.state.paused={init:function(){this.removeOnAudioProcess()},getPlayedPercents:function(){var a=this.getDuration();return this.getCurrentTime()/a||0},getCurrentTime:function(){return this.startPosition}};
WaveSurfer.WebAudio.state.finished={init:function(){this.removeOnAudioProcess();this.fireEvent("finish")},getPlayedPercents:function(){return 1},getCurrentTime:function(){return this.getDuration()}};WaveSurfer.util.extend(WaveSurfer.WebAudio,WaveSurfer.Observer);"use strict";WaveSurfer.MediaElement=Object.create(WaveSurfer.WebAudio);
WaveSurfer.util.extend(WaveSurfer.MediaElement,{init:function(a){this.params=a;this.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){}};this.mediaType=a.mediaType.toLowerCase();this.elementPosition=a.elementPosition;this.setPlaybackRate(this.params.audioRate);this.createTimer();this.singleMediaCreation;this.singleMediaCreationDone;this.canPlayDone},createTimer:function(){var a=this,b=function(){a.isPaused()||(a.fireEvent("audioprocess",a.getCurrentTime()),
(window.requestAnimationFrame||window.webkitRequestAnimationFrame)(b))};this.on("play",b)},load:function(a,b,c){if(this.singleMediaCreationDone)this.singleMediaCreation.src=a;else{var d=document.createElement(this.mediaType);d.controls=this.params.mediaControls;d.autoplay=this.params.autoplay||!1;d.preload="auto";d.src=a;d.style.width="100%";(a=b.querySelector(this.mediaType))&&b.removeChild(a);b.appendChild(d);this.singleMediaCreation=d}this._load(d,c)},loadElt:function(a,b){a.controls=this.params.mediaControls;
a.autoplay=this.params.autoplay||!1;this._load(a,b)},_load:function(a,b){var c=this;this.singleMediaCreation&&(this.media=a=this.singleMediaCreation);this.canPlayDone=!1;a.load();this.singleMediaCreationDone||(a.addEventListener("error",function(){c.fireEvent("error","Error loading media element")}),a.addEventListener("canplay",function(){c.canPlayDone||(c.fireEvent("canplay"),c.canPlayDone=!0)}),a.addEventListener("ended",function(){c.fireEvent("finish")}),this.singleMediaCreationDone=!0);this.peaks=
b;this.buffer=this.onPlayEnd=null;this.setPlaybackRate(this.playbackRate)},isPaused:function(){return!this.media||this.media.paused},getDuration:function(){var a=this.media.duration;Infinity<=a&&(a=this.media.seekable.end(0));return a},getCurrentTime:function(){return this.media&&this.media.currentTime},getPlayedPercents:function(){return this.getCurrentTime()/this.getDuration()||0},setPlaybackRate:function(a){this.playbackRate=a||1;this.media.playbackRate=this.playbackRate},seekTo:function(a){null!=
a&&(this.media.currentTime=a);this.clearPlayEnd()},play:function(a,b){var c=this;this.seekTo(a);var d=this.media.play();void 0!==d?d.then(function(a){b&&c.setPlayEnd(b);c.fireEvent("play")})["catch"](function(a){c.media.pause()}):(this.media.play(),b&&this.setPlayEnd(b),this.fireEvent("play"))},pause:function(){this.media&&this.media.pause();this.clearPlayEnd();this.fireEvent("pause")},setPlayEnd:function(a){var b=this;this.onPlayEnd=function(c){c>=a&&(b.pause(),b.seekTo(a))};this.on("audioprocess",
this.onPlayEnd)},clearPlayEnd:function(){this.onPlayEnd&&(this.un("audioprocess",this.onPlayEnd),this.onPlayEnd=null)},getPeaks:function(a){return this.buffer?WaveSurfer.WebAudio.getPeaks.call(this,a):this.peaks||[]},getVolume:function(){return this.media.volume},setVolume:function(a){this.media.volume=a},destroy:function(){this.pause();this.unAll();this.media&&this.media.parentNode&&this.media.parentNode.removeChild(this.media);this.singleMediaCreation=this.media=null;this.singleMediaCreationDone=
!1}});WaveSurfer.AudioElement=WaveSurfer.MediaElement;"use strict";
WaveSurfer.Drawer={init:function(a,b){this.container=a;this.params=b;this.width=0;this.height=b.height*this.params.pixelRatio;this.lastPos=0;this.initDrawer(b);this.createWrapper();this.createElements()},createWrapper:function(){this.wrapper=this.container.appendChild(document.createElement("wave"));this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"});(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,
{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"});this.setupWrapperEvents()},handleEvent:function(a,b){!b&&a.preventDefault();var c=a.targetTouches?a.targetTouches[0].clientX:a.clientX,d=this.wrapper.getBoundingClientRect(),f=this.width,e=this.getWidth();!this.params.fillParent&&f<e?(c=(c-d.left)*this.params.pixelRatio/f||0,1<c&&(c=1)):c=(c-d.left+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0;return c},setupWrapperEvents:function(){var a=this;this.wrapper.addEventListener("click",
function(b){var c=a.wrapper.offsetHeight-a.wrapper.clientHeight;if(0!=c){var d=a.wrapper.getBoundingClientRect();if(b.clientY>=d.bottom-c)return}a.params.interact&&a.fireEvent("click",b,a.handleEvent(b))});this.wrapper.addEventListener("scroll",function(b){a.fireEvent("scroll",b)})},drawPeaks:function(a,b){this.resetScroll();this.setWidth(b);this.params.barWidth?this.drawBars(a):this.drawWave(a)},style:function(a,b){Object.keys(b).forEach(function(c){a.style[c]!==b[c]&&(a.style[c]=b[c])});return a},
resetScroll:function(){null!==this.wrapper&&(this.wrapper.scrollLeft=0)},recenter:function(a){this.recenterOnPosition(this.wrapper.scrollWidth*a,!0)},recenterOnPosition:function(a,b){var c=this.wrapper.scrollLeft,d=~~(this.wrapper.clientWidth/2),f=a-d,e=f-c,g=this.wrapper.scrollWidth-this.wrapper.clientWidth;0!=g&&(!b&&-d<=e&&e<d&&(e=Math.max(-5,Math.min(5,e)),f=c+e),f=Math.max(0,Math.min(g,f)),f!=c&&(this.wrapper.scrollLeft=f))},getWidth:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)},
setWidth:function(a){this.width=a;this.params.fillParent||this.params.scrollParent?this.style(this.wrapper,{width:""}):this.style(this.wrapper,{width:~~(this.width/this.params.pixelRatio)+"px"});this.updateSize()},setHeight:function(a){a!=this.height&&(this.height=a,this.style(this.wrapper,{height:~~(this.height/this.params.pixelRatio)+"px"}),this.updateSize())},progress:function(a){var b=1/this.params.pixelRatio,c=Math.round(a*this.width)*b;if(c<this.lastPos||c-this.lastPos>=b)this.lastPos=c,this.params.scrollParent&&
this.params.autoCenter&&this.recenterOnPosition(~~(this.wrapper.scrollWidth*a)),this.updateProgress(a)},destroy:function(){this.unAll();this.wrapper&&(this.container.removeChild(this.wrapper),this.wrapper=null)},initDrawer:function(){},createElements:function(){},updateSize:function(){},drawWave:function(a,b){},clearWave:function(){},updateProgress:function(a){}};WaveSurfer.util.extend(WaveSurfer.Drawer,WaveSurfer.Observer);"use strict";WaveSurfer.Drawer.Canvas=Object.create(WaveSurfer.Drawer);
WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas,{createElements:function(){this.waveCc=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1,left:0,top:0,bottom:0})).getContext("2d");this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,left:0,top:0,bottom:0,overflow:"hidden",width:"0",display:"none",boxSizing:"border-box",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",
borderRightColor:this.params.cursorColor}));this.params.waveColor!=this.params.progressColor&&(this.progressCc=this.progressWave.appendChild(document.createElement("canvas")).getContext("2d"))},updateSize:function(){if(this.waveCc.canvas){var a=Math.round(this.width/this.params.pixelRatio);this.waveCc.canvas.width=this.width;this.waveCc.canvas.height=this.height;this.style(this.waveCc.canvas,{width:a+"px"});this.style(this.progressWave,{display:"block"});this.progressCc&&(this.progressCc.canvas.width=
this.width,this.progressCc.canvas.height=this.height,this.style(this.progressCc.canvas,{width:a+"px"}))}this.clearWave()},clearWave:function(){this.waveCc.clearRect(0,0,this.width,this.height);this.progressCc&&this.progressCc.clearRect(0,0,this.width,this.height)},drawBars:function(a,b){if(a[0]instanceof Array){var c=a;if(this.params.splitChannels){this.setHeight(c.length*this.params.height*this.params.pixelRatio);c.forEach(this.drawBars,this);return}a=c[0]}[].some.call(a,function(a){return 0>a})&&
(a=[].filter.call(a,function(a,b){return 0==b%2}));var d=.5/this.params.pixelRatio,f=this.width;c=this.params.height*this.params.pixelRatio;var e=c*b||0,g=c/2;c=a.length;var k=this.params.barWidth*this.params.pixelRatio,m=k+Math.max(this.params.pixelRatio,~~(k/2)),h=1;this.params.normalize&&(h=WaveSurfer.util.max(a));var l=c/f;this.waveCc.fillStyle=this.params.waveColor;this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor);[this.waveCc,this.progressCc].forEach(function(b){if(b)for(var c=
0;c<f;c+=m){var q=Math.round(a[Math.floor(c*l)]/h*g);b.fillRect(c+d,g-q+e,k+d,2*q)}},this)},drawWave:function(a,b){if(a[0]instanceof Array){var c=a;if(this.params.splitChannels){this.setHeight(c.length*this.params.height*this.params.pixelRatio);c.forEach(this.drawWave,this);return}a=c[0]}if(![].some.call(a,function(a){return 0>a})){c=[];for(var d=0,f=a.length;d<f;d++)c[2*d]=a[d],c[2*d+1]=-a[d];a=c}var e=.5/this.params.pixelRatio;c=this.params.height*this.params.pixelRatio;var g=c*b||0,k=c/2,m=~~(a.length/
2),h=1;this.params.fillParent&&this.width!=m&&(h=this.width/m);var l=1;this.params.normalize&&(c=WaveSurfer.util.max(a),d=WaveSurfer.util.min(a),l=-d>c?-d:c);this.waveCc.fillStyle=this.params.waveColor;this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor);[this.waveCc,this.progressCc].forEach(function(b){if(b){b.beginPath();b.moveTo(e,k+g);for(var c=0;c<m;c++){var d=Math.round(a[2*c]/l*k);b.lineTo(c*h+e,k-d+g)}for(c=m-1;0<=c;c--)d=Math.round(a[2*c+1]/l*k),b.lineTo(c*h+e,k-d+g);b.closePath();
b.fill();b.fillRect(0,k+g-e,this.width,e)}},this)},updateProgress:function(a){this.style(this.progressWave,{width:Math.round(this.width*a)/this.params.pixelRatio+"px"})},getImage:function(a,b){return this.waveCc.canvas.toDataURL(a,b)}});"use strict";
(function(){var a=function(){var a=document.querySelectorAll("wavesurfer");Array.prototype.forEach.call(a,function(a){var b=WaveSurfer.util.extend({container:a,backend:"MediaElement",mediaControls:!0},a.dataset);a.style.display="block";b=WaveSurfer.create(b);if(a.dataset.peaks)var c=JSON.parse(a.dataset.peaks);b.load(a.dataset.url,c)})};"complete"===document.readyState?a():window.addEventListener("load",a)})();