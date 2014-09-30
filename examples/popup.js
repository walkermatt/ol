goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.coordinate');
goog.require('ol.layer.Tile');
goog.require('ol.overlay.Popup');
goog.require('ol.proj');
goog.require('ol.source.TileJSON');


/**
 * Create a popup overlay to display info.
 */
var popup = new ol.overlay.Popup({
  panIntoView: true
});


/**
 * Create the map.
 */
var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        url: 'http://api.tiles.mapbox.com/v3/' +
            'mapbox.natural-earth-hypso-bathy.jsonp',
        crossOrigin: 'anonymous'
      })
    })
  ],
  renderer: exampleNS.getRendererFromQueryString(),
  overlays: [popup],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  })
});


/**
 * Add a click handler to the map to show the popup.
 */
map.on('singleclick', function(evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
      coordinate, 'EPSG:3857', 'EPSG:4326'));

  var html = '<p>You clicked here:</p><code>' + hdms + '</code>';
  popup.show(coordinate, html);

});
