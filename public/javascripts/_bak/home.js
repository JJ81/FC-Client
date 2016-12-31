/**
 * Created by yijaejun on 30/11/2016.
 */
'use strict';
requirejs(
	[
		'jquery'
		,'moment'
		,'excellentExport'
		,'bootstrap'
		,'jquery_datatable'
		,'bootstrap_datatable'
		,'select2'
		,'daterangepicker'
		,'jquery_ui'
		,'adminLTE'
		,'fastclick'
	],
	function ($, moment, excellentCsv) {
		// avoid to confliction between jquery tooltip and bootstrap tooltip
		$.widget.bridge('uibutton', $.ui.button);

		// Download csv
		$('.btn_download_csv_home').bind('click', function (){
			return excellentCsv.csv(this, 'table_home', ',');
		});

		// set table func.
		var table_home =
		$('#table_home').DataTable({
			"paging": true,
			"lengthChange": true,
			"searching": true,
			"ordering": true,
			"info": true,
			"autoWidth": true,
			"processing": true
		});

		table_home
			.column( '0:visible' )
			.order( 'desc' )
			.draw();

		// select box
		// $(".select2").select2();

		// datepicker
		$('#daterange-btn').daterangepicker({
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
				'Last 7 Days': [moment().subtract(6, 'days'), moment()],
				'Last 30 Days': [moment().subtract(30, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			},
			startDate: moment().subtract(30, 'days'),
			endDate: moment()
		},
		function (start, end) {
			//$('#daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
			$('#daterange-btn span').html(start.format('YYYY.M.D') + ' - ' + end.format('YYYY.M.D'));
		});

		// Implement with datatables's API
		$('.realSelectBox').bind('change', function () {
			var _self = $(this);
			var val = _self.val();
			if(_self.val() === 'Any Type'){
				val = '';
			}
			table_home.columns( 1 ).search(val).draw();
		});


		// Filtering with date
		$('.daterangepicker .ranges li, .daterangepicker .applyBtn').bind('click', function () {
			if($(this).text().trim() === 'Custom Range'){
				return;
			}

			setTimeout(function () {
				var date = $('.filter_date').text();

				date = date.split('-');
				console.info(date);

				$('#startDate').val(date[0].trim());
				$('#endDate').val(date[1].trim());

				$('.filterWithDate').submit();

			}, 100);
		});

		// daterangepicker의 액션을 제어하기 귀찮아서 액티브를 제거한다.

		$('#daterange-btn').bind('click', function () {
			$('.daterangepicker .ranges li').removeClass('active');
			$('.daterangepicker .ranges').bind('mouseover', function () {
				$('.daterangepicker .ranges li').removeClass('active');
			})
		});



	}); // end of func