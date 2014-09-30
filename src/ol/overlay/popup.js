goog.provide('ol.overlay.Popup');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.style');
goog.require('ol.Overlay');
goog.require('ol.animation');



/**
 * @classdesc
 * Popup overlay
 *
 * @constructor
 * @extends {ol.Overlay}
 * @param {olx.overlay.PopupOptions=} opt_options Popup options
 * @api stable
 */
ol.overlay.Popup = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};
  this.shouldPanIntoView = (goog.isDef(options.panIntoView)) ?
                             options.panIntoView : true;
  this.padding = (goog.isDef(options.padding)) ? options.padding : 10;

  this.closer_ = goog.dom.createDom(goog.dom.TagName.A,
      {'class': 'ol-popup-closer', 'href': '#'});

  this.content_ = goog.dom.createDom(goog.dom.TagName.DIV,
      {'class': 'ol-popup-content'});

  this.container_ = goog.dom.createDom(goog.dom.TagName.DIV,
      {'class': 'ol-popup'}, this.closer_, this.content_);

  goog.events.listen(this.closer_, 'click', function(evt) {
    this.hide();
    this.closer_.blur();
    evt.preventDefault();
  }, false, this);

  ol.Overlay.call(this, {
    element: this.container_,
    positioning: 'bottom-left',
    offset: [-50, -12],
    stopEvent: true
  });

};

ol.inherits(ol.overlay.Popup, ol.Overlay);


/**
 * Show the popup at the given location showing the provided html.
 * @param {ol.Coordinate} coord The location of the popup.
 * @param {String} html The html to display in the popup.
 * @return {ol.overlay.Popup} The popup instance.
 * @api stable
 */
ol.overlay.Popup.prototype.show = function(coord, html) {
  this.setPosition(coord);
  this.content_.innerHTML = html;
  this.container_.style.display = 'block';
  if (this.shouldPanIntoView) {
    this.panIntoView(coord);
  }
  return this;
};

goog.exportProperty(
    ol.overlay.Popup.prototype,
    'show',
    ol.overlay.Popup.prototype.show);


/**
 * Hide the popup.
 * @return {ol.overlay.Popup} The popup instance.
 * @api stable
 */
ol.overlay.Popup.prototype.hide = function() {
  this.container_.style.display = 'none';
  return this;
};

goog.exportProperty(
    ol.overlay.Popup.prototype,
    'hide',
    ol.overlay.Popup.prototype.hide);


/**
 * Attempt to pan the view so that the popup is entirely visible when shown at
 * coord.
 * @param {ol.Coordinate} coord The location of the popup.
 * @return {ol.Coordinate|undefined} The new center of the view.
 */
ol.overlay.Popup.prototype.panIntoView = function(coord) {

  var mapBounds = goog.style.getBounds(this.getMap().getViewport());
  var popBounds = goog.style.getBounds(/** @type {Element} */(
      this.getElement()));

  // Adjust the popup bounds height to take into account the tail
  popBounds.height += Math.abs(this.getOffset()[1]);

  // If the popup is entirely outside the map viewport then simply center on
  // the coordinate
  if (!popBounds.intersects(mapBounds)) {
    return /** @type {ol.Coordinate|undefined} */ (
        this.setCenter_(coord));
  }

  // Adjust popup bounds to be relative to map bounds
  popBounds.left -= mapBounds.left;
  popBounds.top -= mapBounds.top;

  var fromLeft = popBounds.left - this.padding;
  var fromRight = mapBounds.width -
                  (popBounds.left + popBounds.width + this.padding);
  var fromTop = popBounds.top - this.padding;
  var fromBottom = mapBounds.height -
                   (popBounds.top + popBounds.height + this.padding);

  var center = this.getMap().getView().getCenter().slice(0);
  var res = this.getMap().getView().getResolution();

  if (fromRight < 0) {
    center[0] -= fromRight * res;
  } else if (fromLeft < 0) {
    center[0] += fromLeft * res;
  }

  if (fromTop < 0) {
    center[1] -= fromTop * res;
  } else if (fromBottom < 0) {
    center[1] += fromBottom * res;
  }

  return /** @type {ol.Coordinate|undefined} */ (
      this.setCenter_(center));

};


/**
 * Center the view with animation.
 * @param {ol.Coordinate} coord The new center.
 * @return {ol.Coordinate|undefined} The new center of the view.
 * @private
 */
ol.overlay.Popup.prototype.setCenter_ = function(coord) {

  var center = this.getMap().getView().getCenter().slice(0),
      ani_opts = {'duration': 250, 'source': center};

  this.getMap().beforeRender(ol.animation.pan(ani_opts));
  this.getMap().getView().setCenter(coord);

  return /** @type {ol.Coordinate|undefined} */ (
      this.getMap().getView().getCenter());

};
