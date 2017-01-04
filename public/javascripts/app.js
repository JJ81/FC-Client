/**
 * Created by yijaejun on 01/12/2016.
 */
'use strict';
requirejs.config({
	paths: {
		jquery : ['/vendor/plugins/jQuery/jquery-2.2.3.min'],
		jqueryCookie : '/vendor/plugins/jquery_cookie/jquery.cookie.1.4.1',
    plyr: '/vendor/plugins/plyr/src/js/plyr',
    rating: '/vendor/plugins/star-rating-svg/star-rating-svg'
	},
	shim : {
		'jqueryCookie' : {
			deps: ['jquery']
		},
    'rating': {
      deps: ['jquery']
    }
	}
});
