/**
 * Common map helper functions.
 */

class MapHelper {

  /**
  * Show map
  */

  static showMap() {
    const map = document.getElementById('map');
    map.hidden = false;
    const button = document.getElementById('show-map-button');
    button.hidden = true;
  };
}