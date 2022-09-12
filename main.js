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
      this.button.addEventListener('click', evt => this.onButtonClick(evt));
      this.button.addEventListener('keydown', evt => this.onMenuItemKeydown(evt));
    }
    if (this.anchor) {
      this.anchor.addEventListener('click', evt => this.menuContainer.closeAllMenus());
      this.anchor.addEventListener('keydown', evt => this.onMenuItemKeydown(evt));
    }
  }

  get submenuIsOpen () {
    return this.button.getAttribute('aria-expanded') === 'true';
  }

  openSubmenu () {
    // console.log(`openSubmenu: ${this.submenuIsOpen}`);
    this.button.setAttribute('aria-expanded', 'true');
  }

  closeSubmenu () {
    // console.log(`closeSubmenu: ${this.submenuIsOpen}`);
    this.button.setAttribute('aria-expanded', 'false');
  }

  toggleSubmenu () {
    if (this.submenuIsOpen) {
      this.closeSubmenu();
    }
    else {
      this.menuContainer.closeAllSubmenus();
      this.openSubmenu();
    }
  }

  focus () {
    const element = this.anchor || this.button;
    element.focus();
  }

  onButtonClick (evt) {
    evt.stopPropagation();
    this.toggleSubmenu();
    this.focus();
  }

  onMenuItemKeydown (evt) {
    let flag = false;

    switch (evt.key) {
      case 'Esc':
      case 'Escape':
        const target = evt.currentTarget;
        const parentMenu = this.menuContainer.parentMenu;
        const ctrlButton = this.menuContainer.ctrlButton;

        if (target === this.anchor) {
          if (parentMenu) parentMenu.closeAllSubmenus();
          if (ctrlButton) ctrlButton.focus();
        }
        if (target === this.button) {
          if (this.submenuIsOpen) {
            this.closeSubmenu();
          }
          else {
            if (parentMenu) parentMenu.closeAllSubmenus();
            if (ctrlButton) ctrlButton.focus();
          }
        }
        flag = true;
        break;

      case 'Home':
        this.menuContainer.setFocusFirstItem();
        flag = true;
        break;

      case 'End':
        this.menuContainer.setFocusLastItem();
        flag = true;
        break;
    }

    if (flag) {
      evt.preventDefault();
      evt.stopPropagation();
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
  mcButtons = [];

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
      const menuItem = new MenuItem(listItem, this);
      this.menuItems.push(menuItem);
      if (menuItem.button) { this.mcButtons.push(menuItem); }
    }
  }

  // onFocusOut: Handle 'focusout' events for the MenuContainer listElement.
  // It is important to have submenus close automatically when menu items are
  // traversed by keyboard. Without this behavior, nested submenus will remain
  // open after tabbing out of them, which can result in some of the parent
  // submenu items remaining obscured.
  //
  // Note: It is necessary to test whether the 'relatedTarget' of the
  // focusout event (i.e. the element getting focus) is this MenuContainer's
  // ctrlButton.button. Without this test, clicking on the ctrlButton.button
  // when its submenu contains the focused element will cause the submenu to
  // close and then open again. This is because two events are triggered and
  // both of their handlers are activated: the 'focusout' event causes the
  // menu to be closed by this handler (unless the test for 'relatedTarget'
  // is in place), and the 'click' event causes it to be opened again by the
  // MenuItem's click handler, onButtonClick.
  //
  // Note: Safari exhibits behavior similar to that described about unless
  // the call to stopPropagation is added to the onFocusOut handler. Other
  // browsers (Chrome and Firefox) seem to work properly without the call.

  onFocusOut (evt) {
    // console.log(`onFocusOut: ${evt.relatedTarget}`);
    evt.stopImmediatePropagation();
    evt.stopPropagation();

    if (this.ctrlButton === null || evt.relatedTarget === null) {
      return;
    }
    if (evt.relatedTarget === this.ctrlButton.button) {
      return;
    }
    if (!this.listElement.contains(evt.relatedTarget)) {
      this.ctrlButton.closeSubmenu();
    }
  }

  setFocusFirstItem () {
    this.menuItems[0].focus();
  }

  setFocusLastItem () {
    const index = this.menuItems.length - 1;
    this.menuItems[index].focus();
  }

  closeAllSubmenus () {
    for (const menuItem of this.mcButtons) {
      menuItem.submenu.closeAllSubmenus();
      if (menuItem.submenuIsOpen) { menuItem.closeSubmenu(); }
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

    // Assumption: menuContainer listElement is first 'ul' descendant of rootNode
    this.menuContainer = new MenuContainer(rootNode.querySelector('ul'));

    window.addEventListener('unload', this.menuContainer.closeAllSubmenus());
    document.body.addEventListener('pointerdown', evt => this.onPointerDown(evt));
  }

  onPointerDown (evt) {
    // console.log(`pointerType: ${evt.pointerType}`);
    // console.log(`evt.button: ${evt.button}`);
    if (evt.pointerType === 'mouse' && evt.button > 0) {
      return;
    }
    if (!this.rootNode.contains(evt.target)) {
      this.menuContainer.closeAllMenus();
    }
  }
}
