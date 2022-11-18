import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import fetchPictures from './fetchPictures.js';
import { throttle } from 'throttle-debounce';

let getEl = selector => document.querySelector(selector);
getEl('.search-form').addEventListener('submit', onFormSubmit);

let searchSubject = '';
let pageCount = 1;
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'author',
  captionDelay: 250,
});
let documentRect = document.body.getBoundingClientRect().height;

function onFormSubmit(evt) {
  getEl('.gallery').innerHTML = '';

  evt.preventDefault();

  pageCount = 1;
  searchSubject = evt.currentTarget.elements.searchQuery.value.trim();
  if (searchSubject !== '') {
    getResponse();
  }
}
function renderMarkup(data) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        user,
      }) => {
        return `<div class="photo-card">
        <a href="${largeImageURL}">
          <img class="photo-card-pic" src="${webformatURL}" alt="${tags}" author="${user}" width=220px height=180px loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes:</b><span class="info-text">${likes}</span>
          </p>
          <p class="info-item">
            <b>Views:</b><span class="info-text">${views}</span>
          </p>
          <p class="info-item">
            <b>Comments:</b><span class="info-text">${comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads:</b><span class="info-text"> ${downloads}</span>
          </p>
        </div>
      </div>`;
      }
    )
    .join('');

  getEl('.gallery').insertAdjacentHTML('beforeend', markup);
}

function getResponse() {
  fetchPictures(searchSubject, pageCount)
    .then(response => response.data)
    .then(response => {
      if (response.totalHits > 0) {
        renderMarkup(response);
        lightbox.refresh();
        Notiflix.Notify.success(
          `Hooray! We found ${response.totalHits} images.`
        );
        documentRect = document.body.getBoundingClientRect().height;
      } else {
        Notiflix.Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
    })
    .catch(error => {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    });
}

window.addEventListener(
  'scroll',
  throttle(500, e => {
    if (window.scrollY + visualViewport.height + 440 >= documentRect) {
      pageCount++;
      getResponse();
    }
  })
);
