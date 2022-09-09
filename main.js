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
      this.submenu = new MenuContainer(ul, this.button, this.menuContainer);
      this.button.setAttribute('type', 'button');
      this.button.setAttribute('aria-expanded', 'false');
      this.button.addEventListener('click', evt => this.handleButtonClick(evt));
      this.button.addEventListener('keydown', evt => this.handleButtonKeydown(evt));
    }
    if (this.anchor) {
      this.anchor.addEventListener('click', evt => this.menuContainer.closeAllMenus());
      this.anchor.addEventListener('keydown', evt => this.handleAnchorKeydown(evt));
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

  handleButtonKeydown (evt) {
    const key = evt.key,
      target = evt.currentTarget;
    let flag = false;

    switch (key) {
      case 'Esc':
      case 'Escape':
        if (target.getAttribute('aria-expanded') === 'false') {
          const parentMenu = this.menuContainer.parentMenu;
          if (parentMenu) parentMenu.closeAllSubmenus();
          const ctrlButton = this.menuContainer.ctrlButton;
          if (ctrlButton) ctrlButton.focus();
        }
        else {
          this.closeSubmenu();
        }
        flag = true;
        break;
    }

    if (flag) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  handleAnchorKeydown (evt) {
    const key = evt.key;
    let flag = false;

    switch (key) {
      case 'Esc':
      case 'Escape':
        const parentMenu = this.menuContainer.parentMenu;
        if (parentMenu) parentMenu.closeAllSubmenus();
        const ctrlButton = this.menuContainer.ctrlButton;
        if (ctrlButton) ctrlButton.focus();
        flag = true;
        break;
    }

    if (flag) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
}

// ----------------------------------------------------------------
// MenuContainer
//
// Properties:
//   listElement - DOM list element at the root of this container's subtree
//   ctrlButton  - DOM 'button' element that controls this MenuContainer
//   parentMenu  - MenuContainer object that contains this MenuContainer, or
//                 null if this is the top-level MenuContainer
//   menuItems   - array of MenuItem objects that correspond to the immediate
//                 'li' children of this container's listElement

class MenuContainer {
  listElement;
  ctrlButton = null;
  parentMenu = null;
  menuItems = [];

  constructor (listElement, ctrlButton, parentMenu) {
    this.listElement = listElement;

    // These will both be null for the top-level container
    if (ctrlButton) {
      this.ctrlButton = ctrlButton;
    }
    if (parentMenu) {
      this.parentMenu = parentMenu;
    }

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

  closeAllMenus () {
    let topLevel = this.parentMenu || this;
    while (topLevel.parentMenu) {
      topLevel = topLevel.parentMenu;
    }
    topLevel.closeAllSubmenus();
  }
}

// ----------------------------------------------------------------
// DisclosureMenu: Instantiates and maintains a reference to a MenuContainer object

class DisclosureMenu {
  menuContainer;

  constructor (topLevelElement) {
    // Assumption: menuContainer DOM element is first descendant 'ul' element of topLevelElement
    this.menuContainer = new MenuContainer(topLevelElement.querySelector('ul'));
    window.addEventListener('unload', this.menuContainer.closeAllSubmenus());
  }
}
