let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant) || 'images/default.webp';
  image.alt = restaurant.alt;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

addReview = (form) => {
  event.preventDefault();
  const formElements = form.target.elements;
  let restaurantId = getParameterByName('id');
  let { name, raiting, comments } = {};
  for (let i = 0; i < formElements.length ;i++) {
    if (formElements[i].id === 'reviewer-name') { name = formElements[i].value; }
    if (formElements[i].id.startsWith('raiting') && formElements[i].checked) {
      raiting = formElements[i].value;
    }
    if (formElements[i].id === 'review-comments') { comments = formElements[i].value; }
  }

  const newReview = {
    restaurant_id: parseInt(restaurantId),
    name: name,
    rating: parseInt(raiting),
    comments: comments,
    date: (new Date ()).toDateString().substr(4, 14),
  };

  DBHelper.addReview(newReview, (response, status) => {
    switch(status) {
      case 201:
        createPopup('success', 'Review added! Thank you for the feedback.');
        console.log('Review added');
        break;
      case 422:
        createPopup('error', `Error! Review cannot be added due: ${response.body}`);
        console.log('Error', response);
        break;
      case 503:
        createPopup('info', 'The server is offline. The review will be added as soon as the connection has been established.');
        console.log('Server offline');
        break;
      default:
        createPopup('error', 'Unrecognized action happened.');
        console.log('Unrecognized error');
        break;
    }
  });
  document.getElementById('reviews-list').appendChild(createReviewHTML(newReview));
  document.getElementById('review-form').reset();
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Create popup window
 */

createPopup = (type, message) => {
  const closeButtonContainer = document.createElement('div');
  closeButtonContainer.classList.add('close-button-container');
  closeButtonContainer.innerHTML = "<a onclick='destroyPopup()'>X</a>";
  const popupDiv = document.createElement('div');
  popupDiv.classList.add('popup');
  popupDiv.classList.add(type);
  popupDiv.setAttribute('id', 'popup');
  const span = document.createElement('span');
  span.innerHTML = message;
  popupDiv.appendChild(closeButtonContainer);
  popupDiv.appendChild(span);
  document.getElementById('footer').appendChild(popupDiv);
};


/**
 * Destroy popup window
 */

destroyPopup = () => {
  document.getElementById('popup').remove();
};