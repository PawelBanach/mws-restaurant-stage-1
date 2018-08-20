/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   */
  static get RESTAURANTS_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  static get REVIEWS_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.RESTAURANTS_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const restaurants = JSON.parse(xhr.responseText);
        DBHelper.openDatabase().then(function (db) {
          if (!db) { return; }
          let tx = db.transaction('restaurants', 'readwrite');
          let store = tx.objectStore('restaurants');
          restaurants.forEach(function (restaurant) {
            store.put(restaurant);
          });
        });
        callback(null, restaurants);
      } else {
        // Oops!. Got an error from server.
        DBHelper.showCachedRestaurants().then(restaurants => {
          if (restaurants && restaurants.length !== 0) callback(null, restaurants);
          else {
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        });
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${DBHelper.RESTAURANTS_URL}/${id}`);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const restaurant = JSON.parse(xhr.responseText);
        restaurant ? callback(null, restaurant) : callback('Restaurant does not exist', null);
      } else {
        // Oops!. Got an error from server.
        DBHelper.showCachedRestaurants().then(restaurants => {
          const restaurant = restaurants.find(restaurant => restaurant.id.toString() === id);
          if (restaurant) callback(null, restaurant);
          else {
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        });
      }
    };
    xhr.send();
  }

  /**
   * Fetch all restaurant reviews
   */
  static fetchAllRestaurantReviews(id, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${DBHelper.REVIEWS_URL}/?restaurant_id=${id}`);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const reviews = JSON.parse(xhr.responseText);
        if(reviews) {
          DBHelper.openDatabase().then(function (db) {
            if (!db) { return; }
            let tx = db.transaction('reviews', 'readwrite');
            let store = tx.objectStore('reviews');
            reviews.forEach(function (review) {
              store.put(review);
            });
          });
          callback(null, reviews)
        } else callback('There is no reviews for restaurant', null);
      } else {
        // Oops!. Got an error from server.
        DBHelper.showCachedReviewsByRestaurantId(id).then(reviews => {
          if (reviews && reviews.length !== 0) callback(null, reviews);
          else {
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        });
      }
    };
    xhr.send();
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    // not all restaurants object has photograph
    return (restaurant.photograph) ? (`/images/${restaurant.photograph}-270_thumbnail.webp`) : null;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
  *  Open database
  */
  static openDatabase() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('restaurant', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
    });
  }

  /**
   *  Read restaurants from database
   */
  static showCachedRestaurants() {
    return DBHelper.openDatabase().then(db => {
      if (!db) return;
      let index = db.transaction('restaurants').objectStore('restaurants');

      return index.getAll().then(restaurants => {
        return restaurants;
      });
    });
  }

  /**
   *  Read reviews from database
   */
  static showCachedReviewsByRestaurantId(id) {
    return DBHelper.openDatabase().then(db => {
      if (!db) return;
      let index = db.transaction('reviews').objectStore('reviews');

      return index.getAll().then(reviews => {
        return reviews.filter(review => review.restaurant_id === id);
      });
    });
  }

  /**
   * Add review
   */
  static addReview(review, callback) {
    navigator.onLine ? DBHelper.createReview(review, callback) : DBHelper.addReviewWhenOnline(review, callback);
  }

  /**
  * Add review when online
  */
  static addReviewWhenOnline(review, callback) {
    localStorage.setItem('review', JSON.stringify(review));
    window.addEventListener('online', () => {
      let review = localStorage.getItem('review');
      if(review) {
        DBHelper.createReview(JSON.parse(review), callback);
      }
      localStorage.removeItem('review');
    });
    callback(null, 503)
  }

  /**
   * Create review in database
   */
  static createReview(review, callback) {
    const options = {
      method: 'POST',
      body: JSON.stringify(review),
      headers: new Headers({ 'Content-Type': 'application/json'})
    };

    fetch(DBHelper.REVIEWS_URL, options)
      .then(response => callback(response, response.status))
      .catch(response => callback(response, response.status));
  }

  /**
  * Toogle restaurant favourite
  */
  static toogleFavourite(id, favourite, callback) {
    const options = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json'})
    };

    fetch(`${DBHelper.RESTAURANTS_URL}/${id}/?is_favourite=${!favourite}`, options)
      .then(response => callback(response, response.status))
      .catch(response => callback(response, 503));
  }
}
