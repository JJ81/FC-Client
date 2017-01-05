/**
 * Created by parkseokje
 * 강의평가
 */

'use strict';

requirejs([
  'jquery',
  'jqueryRating'
], function (jQuery) {

  var $ = jQuery;

  // http://nashio.github.io/star-rating-svg/demo/
  $(".my-rating").starRating({
      initialRating: 0,
      totalStars: 5,
      disableAfterRate: false,
      starShape: 'rounded',
      starSize: 30,
      emptyColor: '#000',
      hoverColor: '#4baf4d',
      activeColor: '#4baf4d',
      useGradient: false,
      readOnly: false,
      callback: function(currentRating, $el){
        $el.attr('data-rating', currentRating);

        if ($el.hasClass('course')) {
          $('#course').val(currentRating);
        } else if ($el.hasClass('teacher')) {
          $('#teacher').val(currentRating);
        }
      }
  });

});