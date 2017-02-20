/**
 * Created by yijaejun on 01/12/2016.
 */
'use strict';
requirejs.config({
	paths: {
		jquery : ['/vendor/plugins/jQuery/jquery-2.2.3.min'],
		jqueryCookie : '/vendor/plugins/jquery_cookie/jquery.cookie.1.4.1',    
    jqueryRating: '/vendor/plugins/star-rating-svg/star-rating-svg',
    jqueryTimer : '/vendor/plugins/jquery_timer/jquery.timer',
    plyr: '/vendor/plugins/plyr/src/js/plyr',
    Vimeo: '/vendor/plugins/vimeo-player-js/dist/player',
    axios : 'https://unpkg.com/axios/dist/axios.min'
	},
	shim : {
		'jqueryCookie' : {
			deps: ['jquery']
		},
    'jqueryRating': {
      deps: ['jquery']
    },
    'jqueryTimer': {
      deps: ['jquery']
    }
	}
});
