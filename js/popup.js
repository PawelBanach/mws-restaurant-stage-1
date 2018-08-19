/**
 * Popup functions.
 */
class Popup {

  /**
   * Create popup window
   */

  static createPopup(type, message) {
    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.classList.add('close-button-container');
    closeButtonContainer.innerHTML = "<a onclick='Popup.destroyPopup()'>X</a>";
    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');
    popupDiv.classList.add(type);
    popupDiv.setAttribute('id', 'popup');
    const span = document.createElement('span');
    span.innerHTML = message;
    popupDiv.appendChild(closeButtonContainer);
    popupDiv.appendChild(span);
    document.getElementById('footer').appendChild(popupDiv);
  }


  /**
   * Destroy popup window
   */

  static destroyPopup() {
    document.getElementById('popup').remove();
  }
}