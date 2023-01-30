export const select = {
  containerOf: {
    pages: '#pages',
    about: '.about-wrapper',
    finder: '.finder-wrapper',
    grid: '.grid',
    alert: 'alert-container',
  },
  templateOf: {
    about: '#template-about',
    finder: '#template-finder',
    alert: '#template-alert',
  },
  finder: {
    submitBtn: '.submitBtn',
  },
  nav: {
    links: '.main-nav a',
  },
  alert: {
    innerWrapper: '.alert-inner-wrapper',
    closeBtn: '.close',
  },
};

export const classNames = {
  field: 'field',
  fieldSelected: 'selected',
  path: 'path',
  point: 'point',
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
    fadein: 'fade-in',
    fadeout: 'fade-out',
  },
  icons: {
    type: 'fa-solid',
    start: 'fa-location-pin',
    finish: 'fa-location-dot',
    dot: 'fa-circle',
  },
  alert: {
    active: 'active',
    show: 'show',
    hide: 'hide',
  },
};

export const templates = {
  aboutPage: Handlebars.compile(document.querySelector(select.templateOf.about).innerHTML),
  finderPage: Handlebars.compile(document.querySelector(select.templateOf.finder).innerHTML),
  alert: Handlebars.compile(document.querySelector(select.templateOf.alert).innerHTML),
};
