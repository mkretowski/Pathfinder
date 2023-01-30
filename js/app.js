import { select, classNames } from './settings.js';
import Finder from './components/Finder.js';
import About from './components/About.js';

const app = {
  initAbout: function () {
    //init page About
    new About(document.querySelector(select.containerOf.about));
  },

  initFinder: function () {
    //init page Finder
    new Finder(document.querySelector(select.containerOf.finder));
  },

  initPages: function () {
    const thisApp = this;

    thisApp.collectionPages = [];
    thisApp.containerPages = document.querySelector(select.containerOf.pages);
    thisApp.pages = thisApp.containerPages.children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      thisApp.collectionPages.push(page.getAttribute('id'));
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
      }
    }
    thisApp.activatePage(pageMatchingHash);
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', async function (event) {
        const clickedElement = this;
        event.preventDefault();
        if (thisApp.enableFade) {
          thisApp.enableFade = false;
          //get page id from href attribute
          const id = clickedElement.getAttribute('href').replace('#', '');
          //change pages
          await thisApp.fadeEffect(id);
          await thisApp.timer(1000);
          thisApp.enableFade = true;
        }
      });
    }
    //add event listener for mouse wheel
    window.addEventListener('wheel', async function (event) {
      if (thisApp.enableFade) {
        thisApp.enableFade = false;
        await thisApp.handleScroll(event);
        thisApp.enableFade = true;
      }
    });
  },

  activatePage: async function (pageId) {
    const thisApp = this;
    //add class "active" to matching pages
    for (let page of thisApp.pages) {
      if (page.id == pageId) {
        page.classList.add(classNames.pages.active);
        setTimeout(() => {
          page.classList.add(classNames.pages.fadein);
        }, 50);
      }
    }
    //add class "active" to matching links, remove from non-matching
    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },

  init: function () {
    const thisApp = this;
    thisApp.enableFade = true;
    thisApp.initPages();
    thisApp.initAbout();
    thisApp.initFinder();
  },

  timer: function (x) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(x);
      }, x);
    });
  },

  fadeEffect: async function (id) {
    const thisApp = this;
    for (let page of thisApp.pages) {
      if (page.classList.contains('active') && page.id != id) {
        page.classList.remove(classNames.pages.fadein);
        page.classList.add(classNames.pages.fadeout);
        await thisApp.timer(1000);
        page.classList.remove(classNames.pages.active);
        page.classList.remove(classNames.pages.fadeout);
        break;
      }
    }
    await thisApp.activatePage(id);
    /* change URL hash */
    window.location.hash = '#/' + id;
  },

  handleScroll: async function (event) {
    const thisApp = this;
    //determine direction of mouse wheel rotation
    const delta = Math.sign(event.deltaY);
    let id = 0;
    const activePageId = thisApp.containerPages.querySelector('.active').getAttribute('id');
    const activePageIndex = thisApp.collectionPages.indexOf(activePageId);
    if (delta > 0) {
      if (activePageIndex < thisApp.pages.length - 1) {
        id = thisApp.pages[activePageIndex + 1].getAttribute('id');
        await thisApp.fadeEffect(id);
        await thisApp.timer(1000);
      }
    } else {
      if (activePageIndex > 0) {
        id = thisApp.pages[activePageIndex - 1].getAttribute('id');
        await thisApp.fadeEffect(id);
        await thisApp.timer(1000);
      }
    }
  },
};

app.init();

export default app;
