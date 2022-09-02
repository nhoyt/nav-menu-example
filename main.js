/* main.js */

class DisclosureMenu {
  container;
  buttonMap;
  submenuMap;
  submenus = [];

  constructor (containerNode) {
    this.container = containerNode;
    this.buttonMap = new WeakMap();
    this.submenuMap = new WeakMap();
    this.init();
  }

  init () {
    // Assumption: every button element is a menu button that controls a submenu
    const menuButtons = Array.from(this.container.querySelectorAll('button'));

    for (const button of menuButtons) {
      console.log(button.getAttribute('aria-controls'));

      const submenu = document.getElementById(button.getAttribute('aria-controls'));
      if (submenu) {
        // Populate data structures
        this.submenus.push(submenu);
        this.buttonMap.set(button, submenu);
        this.submenuMap.set(submenu, button);
        // Add click event handler to button
        button.addEventListener('click', evt => {
          this.toggleSubmenu(evt.target);
        });
      }
    }
  }

  closeAllSubmenus () {
    for (const submenu of this.submenus) {
      // Hide the submenu
      submenu.classList.add('hide');

      // Update aria-expanded on the button associated with the submenu
      const button = this.submenuMap.get(submenu);
      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
    }
  }

  toggleSubmenu (button) {
    const submenu = this.buttonMap.get(button);
    if (submenu) {
      const isVisible = button.getAttribute('aria-expanded') === 'true';
      if (isVisible) {
        button.setAttribute('aria-expanded', 'false');
        submenu.classList.add('hide');
      }
      else {
        this.closeAllSubmenus();
        button.setAttribute('aria-expanded', 'true');
        submenu.classList.remove('hide');
      }
    }
  }
}
