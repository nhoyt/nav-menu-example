// main.js

// ----------------------------------------------------------------
// MenuItem: An object that encapsulates elements that have either link
//     behavior or button/submenu show/hide behavior.
//
// Properties:
//   listItem: the DOM 'li' element that represents this menuItem
//   menuContainer: the MenuContainer object that contains this menuItem
//   anchor: if the first child of the listItem is an 'a' element, it is
//     assigned to the anchor property
//   button: if the first child of the listItem is a 'button' element, it is
//     assigned to the button property
//   submenu: if the immediate sibling after the button is a 'ul' element, it
//     is assigned to the submenu property

class MenuItem {
  listItem;         // 'li' element for this menuItem
  menuContainer;    // MenuContainer object that contains this menuItem
  anchor  = null;   // If present, an 'a' element
  button  = null;   // if present, a 'button' element
  submenu = null;   // If present, a nested MenuContainer object

  constructor (domElement, menuContainer) {
    this.listItem = domElement;
    this.menuContainer = menuContainer;

    const firstChild = this.listItem.firstElementChild;
    switch (firstChild.tagName.toLowerCase()) {
      case 'a':
        this.anchor = firstChild;
        break;

      case 'button':
        this.button = firstChild;
        break;
    }

    this.init();
  }

  init () {
    if (this.button) {
      // Assumption: If an 'li' element has a 'button' element as its first
      // child, its immediate sibling is assumed to be a 'ul' element
      // containing the submenu that the button controls.
      const ul = this.listItem.querySelector('button + ul');
      this.submenu = new MenuContainer(ul);
      this.button.setAttribute('type', 'button');
      this.button.setAttribute('aria-expanded', 'false');
      this.button.addEventListener('click', evt => {
        this.handleButtonClick(evt);
      });
    }
  }

  closeSubmenu () {
    this.button.setAttribute('aria-expanded', 'false');
  }

  handleButtonClick (evt) {
    const state = this.button.getAttribute('aria-expanded');
    if (state === 'false') {
      this.menuContainer.closeAllSubmenus();
      this.button.setAttribute('aria-expanded', 'true');
    }
    else {
      this.closeSubmenu();
    }
  }
}

// ----------------------------------------------------------------
// MenuContainer
//
// Properties:
//   listElement: DOM element list container for the menu's 'li' elements
//   menuItems: array of MenuItem objects

class MenuContainer {
  listElement;
  menuItems = [];

  constructor (listElement) {
    this.listElement = listElement;

    const listItems = Array.from(this.listElement.querySelectorAll(':scope > li'));
    console.log(`listItems: ${listItems.length}`);
    for (const listItem of listItems) {
      this.menuItems.push(new MenuItem(listItem, this));
    }
  }

  closeAllSubmenus () {
    for (const menuItem of this.menuItems) {
      if (menuItem.submenu) {
        menuItem.submenu.closeAllSubmenus();
        menuItem.closeSubmenu();
      }
    }
  }
}

// ----------------------------------------------------------------
// DisclosureMenu: Instantiates and maintains a reference to a MenuContainer object

class DisclosureMenu {
  menuContainer;

  constructor (topLevelElement) {
    // Assumption: menuContainer DOM element is first descendant 'ul' element of topLevelElement
    this.menuContainer = new MenuContainer(topLevelElement.querySelector('ul'));
  }
}
