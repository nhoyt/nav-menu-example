// main.js

'use strict';

// ----------------------------------------------------------------
// MenuItem: An object that encapsulates elements that have either link
//   behavior or button/submenu show/hide behavior. Each MenuItem will have
//   EITHER an anchor OR a button (along with the submenu that it controls).
//
// Properties:
//   listItem      - The 'li' element represented by this MenuItem object
//   menuContainer - The MenuContainer object that contains this MenuItem
//   anchor        - If present, the 'a' element in this listItem
//   button        - If present, the 'button' element in this listItem
//   submenu       - If present, the MenuContainer object that represents
//                   the nested 'ul' element in this listItem

class MenuItem {
  listItem;
  menuContainer;
  anchor  = null;
  button  = null;
  submenu = null;

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
      // child, the expectation for this navigation menu markup pattern is
      // that the button's immediate sibling is a 'ul' element containing the
      // submenu that the button controls.
      const ul = this.listItem.querySelector('button + ul');
      if (ul) {
        // Since the 'ul' element immediately follows a 'button' element within
        // an 'li' element, it is assumed to be a submenu within the 'li'.
        this.submenu = new MenuContainer(ul, this, this.menuContainer);
      }
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

  focus () {
    const element = this.anchor || this.button;
    element.focus();
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
// MenuContainer: An object that contains a grouping of MenuItem objects
//   that comprise a top-level menu or a submenu. A MenuContainer is a
//   recursive structure in that its MenuItem objects may also contain
//   MenuContainer objects (specifically, when a MenuItem contains a button
//   and submenu pair.)
//   Important note: The MenuItem objects in the 'menuItems' array represent
//   only the immediate 'li' children of the MenuContainer's 'listElement'.
//   Additional note: The MenuContainer at the top-level of a menu system will
//   have null values for its 'ctrlButton' and 'parentMenu' properties.
//
// Properties:
//   listElement - The list element at the root of this container's subtree
//   ctrlButton  - The MenuItem object that represents the 'button' element
//                 that controls this MenuContainer
//   parentMenu  - The MenuContainer object that contains this MenuContainer
//   menuItems   - An array of MenuItem objects that represent the immediate
//                 'li' children of this container's listElement

class MenuContainer {
  listElement;
  ctrlButton = null;
  parentMenu = null;
  menuItems = [];

  constructor (listElement, ctrlButton, parentMenu) {
    this.listElement = listElement;
    this.listElement.addEventListener('focusout', evt => this.onFocusOut(evt));

    // These will both be null for the top-level container
    if (ctrlButton) {
      this.ctrlButton = ctrlButton;
    }
    if (parentMenu) {
      this.parentMenu = parentMenu;
    }

    const listItems = Array.from(this.listElement.querySelectorAll(':scope > li'));
    // console.log(`listItems: ${listItems.length}`);
    for (const listItem of listItems) {
      this.menuItems.push(new MenuItem(listItem, this));
    }
  }

  onFocusOut (evt) {
    if (this.ctrlButton && !this.listElement.contains(evt.relatedTarget)) {
      this.ctrlButton.closeSubmenu();
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
    // Get the top-level MenuContainer object
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
  rootNode;
  menuContainer;

  constructor (rootNode) {
    this.rootNode = rootNode;
    this.rootNode.addEventListener('focusout', evt => this.onFocusOut(evt));

    // Assumption: menuContainer DOM element is first descendant 'ul' element of rootNode
    this.menuContainer = new MenuContainer(rootNode.querySelector('ul'));
    window.addEventListener('unload', this.menuContainer.closeAllSubmenus());
  }

  onFocusOut (evt) {
    if (!this.rootNode.contains(evt.relatedTarget)) {
      this.menuContainer.closeAllMenus();
    }
  }
}
