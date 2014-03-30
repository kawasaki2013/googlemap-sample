
/**
 * 生成した InfoWindow をストックする。
 * 
 */
var infoWindowStock = new InfoWindowStock();
var markers;
var board = new ToggleBoard();

$(function() {
	var geocoder = new google.maps.Geocoder();

	// 初期表示
	var address = $('#address').val();
	geocoder.geocode({'address': address}, callbackRender);

	// 住所が入力された場合の対応
	$('#address').change(function(event) {
		address = $(this).val();
		geocoder.geocode({'address': address}, callbackRender);
	});

	setUpToggleButtons();
});

/**
 * トグルボタンがクリックされたら ID 属性名称を取得して、`ToggleBoard#toggle` を実行する。
 * 
 */
function setUpToggleButtons () {
	$('button[data-toggle]').click(function() {
		var id = $(this).attr('id');
		board.toggle(id);

		if(markers) {
			markers.toggleMarker(board.ne, board.nw, board.se, board.sw);
		}
	});
}

/**
 * ジオコーダの結果を取得したときに実行するコールバック関数。
 * 
 * この関数内で GoogleMap を出力する。
 * 
 * @param results ジオコーダの結果
 * @param status ジオコーディングのステータス
 * 
 */
function callbackRender(results, status) {
	if(status == google.maps.GeocoderStatus.OK) {
		var options = {
			zoom: 18,
			center: results[0].geometry.location, // 指定の住所から計算した緯度経度を指定する
			mapTypeId: google.maps.MapTypeId.ROADMAP // 「地図」で GoogleMap を出力する
		};
		var gmap = new google.maps.Map(document.getElementById('map-canvas'), options);
			// #map-canvas に GoogleMap を出力する

		markers = new Markers(results[0].geometry.location);
			// Markers オブジェクトの生成
		displayMarker(gmap, results[0].geometry.location);
			// 初期値の住所から計算した緯度経度の位置に Marker を立てる
		google.maps.event.addListener(gmap, 'click', function(event) {
			// GoogleMap 上で左クリックがあったら、、、
			displayMarker(gmap, event.latLng);
				// その場所に Marker を立てる
		});

		adjustMapSize();
	}
}

/**
 * 指定の場所に InfoWindow を設定した Marker を表示する。
 * 
 * @param  {Object} map Marker を立てる GoogleMap オブジェクト
 * @param  {Object} location Marker を立てる位置
 */
function displayMarker(map, location) {
	var marker = new google.maps.Marker({map: map, position: location});
		// Marker オブジェクトを生成して、地図上に表示する

	markers.add(marker);
	infoWindowStock.put(location, marker); // Marker の InfoWindow オブジェクトを生成して stock に追加する
	google.maps.event.addListener(marker, 'click', function(event) { // Marker がクリックされたら、、、
		infoWindowStock.redisplay(event.latLng, marker); // クリックされた Marker の InfoWindow を再表示する
	});
}

/**
 * GoogleMap を表示する div タグのサイズを調整する。
 * 
 */
function adjustMapSize() {
	var padding = $('#header-hollow').height(); // 住所入力欄の height を取得

	var mapCanvas = $('#map-canvas');
	mapCanvas.css("height", ($(window).height() - mapCanvas.offset().top) - padding + "px");
}
