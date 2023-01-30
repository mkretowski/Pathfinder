import { templates } from '../settings.js';

class About {
  constructor(element) {
    const thisAbout = this;
    thisAbout.element = element;
    thisAbout.render(element);
  }
  render(element) {
    const thisAbout = this;
    thisAbout.dom = {};
    /* generate HTML based on temlate */
    const generatedHTML = templates.aboutPage();
    /* find about container */
    thisAbout.dom.wrapper = element;
    /* add HTML to about container */
    thisAbout.dom.wrapper.innerHTML = generatedHTML;
  }
}
export default About;
