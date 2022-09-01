/* main.js */

class DisclosureMenu {
  constructor (container) {

    this.containerNode = container;
    this.menuButtons = container.querySelectorAll('button');
    this.addListeners();
  }

  addListeners () {
    for (const button of this.menuButtons) {
      console.log(button.getAttribute('aria-controls'));

      button.addEventListener('click', evt => {
      });
    }
  }

  getSubmenu (button) {
    const id = button.getAttribute('aria-controls');
    return document.getElementById(id);
  }
}
