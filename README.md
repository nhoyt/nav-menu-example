# nav-menu-example

Navigation menu example with the following features:

* Built only with modern HTML, CSS and JavaScript
* Includes nested submenus (submenus triggered by menu items in submenus) to an arbitrary depth
* Could be used to test how submenus are rendered when they include many menu items

See it live: [nav-menu-example on GitHub Pages](https://nhoyt.github.io/nav-menu-example).

## Conceptual Model

The following features are present in the JavaScript code:

* From a programming perspective, navigation menus are recursive data structures or systems.

* A MenuContainer object contains MenuItems, which can act either as links or menu buttons that show or hide a submenu. In the menu button case, a MenuItem will contain a nested MenuContainer that represents the submenu.

* A MenuItem that contains only an anchor ('a' element) exhibits simple link behavior.

* A MenuItem with menu button behavior contains a 'button' element and a 'ul' or unordered list element that is initially hidden. When the button is activated, it toggles the visibility of the submenu ('ul' element). In the code, the 'ul' element is used to construct a nested MenuContainer.

* A MenuContainer not only contains MenuItem objects, but also a reference to the menu button that controls it ('ctrlButton') and the container's parent menu ('parentMenu'), if they exist.

* The top-level menu container is represented by a MenuContainer in the code. Its parentMenu and ctrlButton references are null.

The following markup patterns are followed in creating the HTML for the navigation menu:

* A 'nav' element is used as the wrapper for the top-level 'ul' element.

* 'ul' elements are used as containers for the top-level menu and any nested submenus within the menu system. In the JavaScript code, each menu container is represented by an instance of the MenuContainer class.

* List item 'li' elements within 'ul' elements can be thought of as menu items. In the code, each menu items is represented by an instance of the MenuItem class.

* A MenuItem can have only one of two possible behaviors:
  * Behaves as a link, which is the case when the 'li' element contains only an 'a' element.
  * Behaves as a menu button that will show or hide a submenu, which is the case when the 'li' element contains the following pair of elements: a 'button' element immediately followed by a 'ul' element.

## To Do

* (x) When focus leaves a submenu, close that submenu (auto-close is needed when submenus have sub-submenus to avoid obscuring focused element).
* (x) When focus leaves the menu system, closeAllSubmenus. This includes handling the following cases: (1) user tabs or shift-tabs out of the menu system, and (2) user clicks on the page outside of the menu system.
* (x) Up-/Down-arrow keys: when focus is on a button and its submenu is visible, down-arrow moves to the first item within the submenu; otherwise the up-/down-arrow keys move focus to the previous/next item within the current menu (but without wraparound).
* (x) Left-/Right-arrow keys: when focus is within a submenu, left-/right-arrow acts as a shortcut that moves focus to the previous/next item in the parent menu; otherwise (when you're at the top-level menu), the left-/right-arrow keys move focus to the previous/next item in the current menu.
* (x) Menu button visual indicators (chevrons) created using CSS for compatibility with High Contrast Mode (as opposed to using images).
