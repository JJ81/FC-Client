"use strict";window.requirejs(["common","aquaPlayerService"],function(a,e){var o,i=i||window.$,r=i("#aqua_html5"),n=i("#aqua_window");i(function(){"Windows"===a.getOSName?n.show():r.show();var t={fileUrl:i("#video").data("url"),watermark:i("#video").data("watermark"),callback:function(a){a&&(o=a,o.setVolume(.5))}};e=new e(t)})});
//# sourceMappingURL=../maps/help.js.map
