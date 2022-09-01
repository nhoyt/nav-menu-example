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
        this.toggleSubmenu(evt.target);
      });
    }
  }

  getSubmenu (button) {
    const idSubmenu = button.getAttribute('aria-controls');
    return document.getElementById(idSubmenu);
  }

  toggleSubmenu (button) {
    const submenu = this.getSubmenu(button);
    if (button.getAttribute('aria-expanded') === 'true') {
      button.setAttribute('aria-expanded', 'false');
      submenu.style.display = 'none';
    }
    else {
      button.setAttribute('aria-expanded', 'true');
      submenu.style.display = 'block';
    }
  }
}
