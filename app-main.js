/*
 * LPB — Landing Page Builder
 * app-main.js
 *
 * Main application logic
 */

"use strict";

/* =========================================================
   LPB GLOBAL
========================================================= */

const LPB = {
  version: "1.0.0",

  storage: {
    project: "lpb_project",
    downloads: "lpb_downloads"
  },

  state: {
    page: {
      name: "Untitled Landing Page",
      elements: []
    },

    selectedElement: null,

    zoom: 1,

    device: "desktop",

    tool: "select",

    history: [],

    historyIndex: -1,

    isDragging: false
  }
};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}


/* =========================================================
   STORAGE
========================================================= */

function saveProject() {
  try {
    localStorage.setItem(
      LPB.storage.project,
      JSON.stringify(LPB.state.page)
    );

    updateSaveStatus("Saved");
  } catch (error) {
    console.error("LPB: Failed to save project:", error);

    updateSaveStatus("Save failed");
  }
}


function loadProject() {
  try {
    const saved = localStorage.getItem(
      LPB.storage.project
    );

    if (!saved) {
      return false;
    }

    const project = JSON.parse(saved);

    if (
      !project ||
      typeof project !== "object"
    ) {
      return false;
    }

    LPB.state.page = project;

    return true;

  } catch (error) {
    console.error("LPB: Failed to load project:", error);

    return false;
  }
}


/* =========================================================
   SAVE STATUS
========================================================= */

function updateSaveStatus(status) {
  const element = $("#saveStatus");

  if (!element) {
    return;
  }

  element.textContent = status;
}


function markUnsaved() {
  updateSaveStatus("Unsaved");
}


/* =========================================================
   HISTORY
========================================================= */

function cloneData(data) {
  return JSON.parse(
    JSON.stringify(data)
  );
}


function pushHistory() {
  const snapshot = cloneData(
    LPB.state.page
  );

  LPB.state.history =
    LPB.state.history.slice(
      0,
      LPB.state.historyIndex + 1
    );

  LPB.state.history.push(snapshot);

  LPB.state.historyIndex =
    LPB.state.history.length - 1;

  /*
   * Prevent unlimited memory usage.
   */

  if (LPB.state.history.length > 50) {
    LPB.state.history.shift();

    LPB.state.historyIndex--;
  }
}


function undo() {
  if (LPB.state.historyIndex <= 0) {
    return;
  }

  LPB.state.historyIndex--;

  LPB.state.page =
    cloneData(
      LPB.state.history[
        LPB.state.historyIndex
      ]
    );

  renderProject();

  saveProject();
}


function redo() {
  if (
    LPB.state.historyIndex >=
    LPB.state.history.length - 1
  ) {
    return;
  }

  LPB.state.historyIndex++;

  LPB.state.page =
    cloneData(
      LPB.state.history[
        LPB.state.historyIndex
      ]
    );

  renderProject();

  saveProject();
}


/* =========================================================
   DEFAULT PROJECT
========================================================= */

function createDefaultProject() {
  return {
    name: "Untitled Landing Page",

    elements: [
      {
        id: createId(),

        type: "hero",

        content: {
          heading: "Build Something Great.",

          description:
            "Create beautiful landing pages without writing a single line of code.",

          button:
            "Get Started"
        },

        style: {
          background: "#ffffff",

          color: "#111111",

          width: "100%",

          height: "430px",

          padding: "70px 50px",

          margin: "0",

          fontFamily: "Inter",

          fontSize: "54px",

          fontWeight: "700",

          borderWidth: "0",

          borderRadius: "0"
        }
      },

      {
        id: createId(),

        type: "section",

        content: {},

        style: {
          background: "#ffffff",

          color: "#111111",

          width: "100%",

          height: "260px",

          padding: "70px 50px",

          margin: "0",

          fontFamily: "Inter",

          fontSize: "16px",

          fontWeight: "400",

          borderWidth: "0",

          borderRadius: "0"
        }
      }
    ]
  };
}


/* =========================================================
   ID
========================================================= */

function createId() {
  return (
    "lpb-" +
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}


/* =========================================================
   OBJECT FACTORY
========================================================= */

function createElement(type) {
  const base = {
    id: createId(),

    type,

    content: {},

    style: {
      background: "#ffffff",

      color: "#111111",

      width: "100%",

      height: "260px",

      padding: "40px",

      margin: "0",

      fontFamily: "Inter",

      fontSize: "16px",

      fontWeight: "400",

      borderWidth: "0",

      borderRadius: "0"
    }
  };


  switch (type) {

    case "heading":
      base.content.text =
        "New Heading";
      break;


    case "text":
      base.content.text =
        "Write your content here.";
      break;


    case "button":
      base.content.text =
        "Click Me";

      base.content.url =
        "#";
      break;


    case "image":
      base.content.src =
        "";

      base.content.alt =
        "Image";
      break;


    case "video":
      base.content.src =
        "";

      base.content.title =
        "Video";
      break;


    case "navbar":
      base.content.logo =
        "LPB";

      base.content.links = [
        "Home",
        "About",
        "Contact"
      ];

      base.style.height =
        "70px";
      break;


    case "hero":
      base.content.heading =
        "Your Amazing Landing Page";

      base.content.description =
        "Describe your product, service, or idea.";

      base.content.button =
        "Get Started";

      base.style.height =
        "430px";

      base.style.fontSize =
        "54px";
      break;


    case "features":
      base.content.title =
        "Features";

      base.content.items = [
        "Fast",
        "Simple",
        "Powerful"
      ];

      base.style.height =
        "320px";
      break;


    case "pricing":
      base.content.title =
        "Simple Pricing";

      base.content.price =
        "$0";

      base.content.button =
        "Choose Plan";

      base.style.height =
        "300px";
      break;


    case "testimonials":
      base.content.quote =
        "This product is amazing.";

      base.content.author =
        "Customer";

      base.style.height =
        "280px";
      break;


    case "footer":
      base.content.text =
        "© 2026 Your Company";

      base.style.height =
        "120px";
      break;


    case "input":
      base.content.placeholder =
        "Enter something...";

      base.style.height =
        "50px";
      break;


    case "form":
      base.content.title =
        "Contact Us";

      base.content.button =
        "Submit";

      base.style.height =
        "280px";
      break;


    case "link":
      base.content.text =
        "Learn More";

      base.content.url =
        "#";
      break;


    case "container":
      base.style.height =
        "220px";
      break;


    case "section":
    default:
      break;
  }


  return base;
}


/* =========================================================
   RENDER PROJECT
========================================================= */

function renderProject() {
  const canvas = $("#canvas");

  if (!canvas) {
    return;
  }

  canvas.innerHTML = "";


  const elements =
    LPB.state.page.elements || [];


  elements.forEach(element => {
    const node =
      createDOMElement(element);

    canvas.appendChild(node);
  });


  bindCanvasEvents();

  updateObjectCount();

  applyZoom();

  applyDevice();

  restoreSelection();
}


/* =========================================================
   CREATE DOM ELEMENT
========================================================= */

function createDOMElement(element) {

  const wrapper =
    document.createElement("section");


  wrapper.className =
    "page-section";


  wrapper.dataset.element =
    element.id;


  wrapper.dataset.type =
    element.type;


  applyElementStyles(
    wrapper,
    element
  );


  const label =
    document.createElement("span");

  label.className =
    "section-label";

  label.textContent =
    element.type;


  wrapper.appendChild(label);


  switch (element.type) {

    case "hero":
      renderHero(wrapper, element);
      break;


    case "heading":
      renderHeading(wrapper, element);
      break;


    case "text":
      renderText(wrapper, element);
      break;


    case "button":
      renderButton(wrapper, element);
      break;


    case "image":
      renderImage(wrapper, element);
      break;


    case "video":
      renderVideo(wrapper, element);
      break;


    case "navbar":
      renderNavbar(wrapper, element);
      break;


    case "features":
      renderFeatures(wrapper, element);
      break;


    case "pricing":
      renderPricing(wrapper, element);
      break;


    case "testimonials":
      renderTestimonials(wrapper, element);
      break;


    case "footer":
      renderFooter(wrapper, element);
      break;


    case "input":
      renderInput(wrapper, element);
      break;


    case "form":
      renderForm(wrapper, element);
      break;


    case "link":
      renderLink(wrapper, element);
      break;


    case "container":
      renderContainer(wrapper, element);
      break;


    case "section":
    default:
      renderEmptySection(
        wrapper,
        element
      );
      break;
  }


  return wrapper;
}


/* =========================================================
   ELEMENT STYLES
========================================================= */

function applyElementStyles(
  node,
  element
) {
  const style =
    element.style || {};


  if (style.background) {
    node.style.background =
      style.background;
  }


  if (style.color) {
    node.style.color =
      style.color;
  }


  if (style.width) {
    node.style.width =
      style.width;
  }


  if (style.height) {
    node.style.minHeight =
      style.height;
  }


  if (style.padding) {
    node.style.padding =
      style.padding;
  }


  if (style.margin) {
    node.style.margin =
      style.margin;
  }


  if (style.fontFamily) {
    node.style.fontFamily =
      style.fontFamily;
  }


  if (style.borderWidth) {
    node.style.borderWidth =
      style.borderWidth;

    node.style.borderStyle =
      "solid";
  }


  if (style.borderRadius) {
    node.style.borderRadius =
      style.borderRadius;
  }
}


/* =========================================================
   RENDERERS
========================================================= */

function renderHero(
  node,
  element
) {
  node.classList.add(
    "hero-object"
  );


  const heading =
    document.createElement("h1");

  heading.textContent =
    element.content.heading ||
    "Hero Heading";


  heading.style.fontSize =
    element.style.fontSize ||
    "54px";


  heading.style.fontWeight =
    element.style.fontWeight ||
    "700";


  node.appendChild(heading);


  const description =
    document.createElement("p");

  description.textContent =
    element.content.description ||
    "";


  node.appendChild(
    description
  );


  if (element.content.button) {

    const button =
      document.createElement("span");

    button.className =
      "hero-button";

    button.textContent =
      element.content.button;

    node.appendChild(button);
  }
}


function renderHeading(
  node,
  element
) {
  const heading =
    document.createElement("h1");

  heading.textContent =
    element.content.text ||
    "Heading";


  heading.style.fontSize =
    element.style.fontSize ||
    "32px";


  heading.style.fontWeight =
    element.style.fontWeight ||
    "700";


  node.appendChild(heading);
}


function renderText(
  node,
  element
) {
  const text =
    document.createElement("p");

  text.textContent =
    element.content.text ||
    "Text";


  text.style.fontSize =
    element.style.fontSize ||
    "16px";


  node.appendChild(text);
}


function renderButton(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";


  const button =
    document.createElement("button");

  button.textContent =
    element.content.text ||
    "Button";


  button.style.padding =
    "12px 20px";

  button.style.background =
    "#111111";

  button.style.color =
    "#ffffff";

  button.style.borderRadius =
    "7px";

  button.style.cursor =
    "pointer";


  node.appendChild(button);
}


function renderImage(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";


  if (!element.content.src) {

    const placeholder =
      document.createElement("div");

    placeholder.textContent =
      "Image";

    placeholder.style.color =
      "#999999";

    node.appendChild(
      placeholder
    );

    return;
  }


  const image =
    document.createElement("img");

  image.src =
    element.content.src;

  image.alt =
    element.content.alt ||
    "Image";

  image.style.maxWidth =
    "100%";

  image.style.maxHeight =
    "100%";


  node.appendChild(image);
}


function renderVideo(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";


  if (!element.content.src) {

    const placeholder =
      document.createElement("div");

    placeholder.textContent =
      "▶ Video";

    placeholder.style.color =
      "#777777";

    node.appendChild(
      placeholder
    );

    return;
  }


  const video =
    document.createElement("video");

  video.src =
    element.content.src;

  video.controls =
    true;

  video.style.maxWidth =
    "100%";

  video.style.maxHeight =
    "100%";


  node.appendChild(video);
}


function renderNavbar(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "space-between";


  const logo =
    document.createElement("strong");

  logo.textContent =
    element.content.logo ||
    "Logo";


  node.appendChild(logo);


  const links =
    document.createElement("div");

  links.style.display =
    "flex";

  links.style.gap =
    "20px";


  (
    element.content.links ||
    []
  ).forEach(text => {

    const link =
      document.createElement("span");

    link.textContent =
      text;

    link.style.fontSize =
      "13px";

    links.appendChild(link);
  });


  node.appendChild(links);
}


function renderFeatures(
  node,
  element
) {
  const title =
    document.createElement("h2");

  title.textContent =
    element.content.title ||
    "Features";


  title.style.textAlign =
    "center";


  node.appendChild(title);


  const grid =
    document.createElement("div");

  grid.style.display =
    "grid";

  grid.style.gridTemplateColumns =
    "repeat(3, 1fr)";

  grid.style.gap =
    "20px";

  grid.style.marginTop =
    "30px";


  (
    element.content.items ||
    []
  ).forEach(item => {

    const card =
      document.createElement("div");

    card.textContent =
      item;

    card.style.padding =
      "25px";

    card.style.background =
      "#f5f5f5";

    card.style.borderRadius =
      "8px";

    grid.appendChild(card);
  });


  node.appendChild(grid);
}


function renderPricing(
  node,
  element
) {
  node.style.textAlign =
    "center";


  const title =
    document.createElement("h2");

  title.textContent =
    element.content.title ||
    "Pricing";


  node.appendChild(title);


  const price =
    document.createElement("strong");

  price.textContent =
    element.content.price ||
    "$0";


  price.style.display =
    "block";

  price.style.marginTop =
    "20px";

  price.style.fontSize =
    "40px";


  node.appendChild(price);


  const button =
    document.createElement("button");

  button.textContent =
    element.content.button ||
    "Choose";


  button.style.marginTop =
    "20px";

  button.style.padding =
    "10px 18px";


  node.appendChild(button);
}


function renderTestimonials(
  node,
  element
) {
  node.style.textAlign =
    "center";


  const quote =
    document.createElement("blockquote");

  quote.textContent =
    `"${element.content.quote || ""}"`;


  quote.style.fontSize =
    "22px";


  node.appendChild(quote);


  const author =
    document.createElement("p");

  author.textContent =
    element.content.author ||
    "Customer";


  author.style.marginTop =
    "15px";


  node.appendChild(author);
}


function renderFooter(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";


  const text =
    document.createElement("span");

  text.textContent =
    element.content.text ||
    "Footer";


  node.appendChild(text);
}


function renderInput(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";


  const input =
    document.createElement("input");

  input.placeholder =
    element.content.placeholder ||
    "Input";


  input.style.width =
    "100%";

  input.style.height =
    "42px";

  input.style.padding =
    "0 12px";

  input.style.border =
    "1px solid #dddddd";

  input.style.borderRadius =
    "6px";


  node.appendChild(input);
}


function renderForm(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.flexDirection =
    "column";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";

  node.style.gap =
    "12px";


  const title =
    document.createElement("h2");

  title.textContent =
    element.content.title ||
    "Contact Form";


  node.appendChild(title);


  const input =
    document.createElement("input");

  input.placeholder =
    "Your email";

  input.style.padding =
    "10px";

  input.style.width =
    "300px";


  node.appendChild(input);


  const button =
    document.createElement("button");

  button.textContent =
    element.content.button ||
    "Submit";


  button.style.padding =
    "10px 20px";


  node.appendChild(button);
}


function renderLink(
  node,
  element
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";


  const link =
    document.createElement("a");

  link.textContent =
    element.content.text ||
    "Learn More";

  link.href =
    element.content.url ||
    "#";


  link.style.color =
    "#111111";

  link.style.textDecoration =
    "underline";


  node.appendChild(link);
}


function renderContainer(
  node
) {
  node.style.display =
    "flex";

  node.style.alignItems =
    "center";

  node.style.justifyContent =
    "center";


  const text =
    document.createElement("span");

  text.textContent =
    "Container";


  text.style.color =
    "#999999";


  node.appendChild(text);
}


function renderEmptySection(
  node
) {
  node.innerHTML += `
    <div
      class="empty-section"
    >
      Drop an object here
    </div>
  `;
}


/* =========================================================
   CANVAS EVENTS
========================================================= */

function bindCanvasEvents() {

  $$(".page-section").forEach(
    element => {

      element.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          selectElement(
            element.dataset.element
          );
        }
      );
    }
  );


  const canvas =
    $("#canvas");

  if (!canvas) {
    return;
  }


  canvas.addEventListener(
    "click",
    event => {

      if (
        event.target === canvas
      ) {
        deselectElement();
      }
    }
  );
}


/* =========================================================
   SELECT ELEMENT
========================================================= */

function selectElement(id) {

  LPB.state.selectedElement =
    id;


  $$(".page-section").forEach(
    node => {

      node.classList.toggle(
        "selected",

        node.dataset.element === id
      );
    }
  );


  updatePropertiesPanel();
}


function deselectElement() {

  LPB.state.selectedElement =
    null;


  $$(".page-section").forEach(
    node => {
      node.classList.remove(
        "selected"
      );
    }
  );


  const selected =
    $("#selectedObject");

  if (selected) {
    selected.textContent =
      "No object selected";
  }
}


function restoreSelection() {

  if (
    LPB.state.selectedElement
  ) {

    const exists =
      LPB.state.page.elements
        .some(
          element =>
            element.id ===
            LPB.state.selectedElement
        );


    if (exists) {
      selectElement(
        LPB.state.selectedElement
      );

      return;
    }
  }


  if (
    LPB.state.page.elements.length
  ) {

    selectElement(
      LPB.state.page.elements[0].id
    );
  }
}


/* =========================================================
   FIND SELECTED DATA
========================================================= */

function getSelectedElement() {

  return LPB.state.page.elements.find(
    element =>
      element.id ===
      LPB.state.selectedElement
  );
}


/* =========================================================
   PROPERTIES PANEL
========================================================= */

function updatePropertiesPanel() {

  const element =
    getSelectedElement();


  if (!element) {
    return;
  }


  const selected =
    $("#selectedObject");


  if (selected) {

    selected.textContent =
      `${capitalize(element.type)} Object`;
  }


  const content =
    element.content || {};

  const style =
    element.style || {};


  setValue(
    "#headingInput",
    content.heading
  );


  setValue(
    "#descriptionInput",
    content.description
  );


  setValue(
    "#buttonInput",
    content.button ||
    content.text
  );


  setValue(
    "#widthInput",
    style.width
  );


  setValue(
    "#heightInput",
    style.height
  );


  setValue(
    "#paddingInput",
    style.padding
  );


  setValue(
    "#marginInput",
    style.margin
  );


  setValue(
    "#fontInput",
    style.fontFamily
  );


  setValue(
    "#fontSizeInput",
    style.fontSize
  );


  setValue(
    "#fontWeightInput",
    style.fontWeight
  );


  setValue(
    "#backgroundColorText",
    style.background
  );


  setValue(
    "#textColorText",
    style.color
  );


  setValue(
    "#borderWidth",
    style.borderWidth
  );


  setValue(
    "#borderRadius",
    style.borderRadius
  );


  const background =
    $("#backgroundColor");

  if (
    background &&
    isColor(style.background)
  ) {
    background.value =
      style.background;
  }


  const textColor =
    $("#textColor");

  if (
    textColor &&
    isColor(style.color)
  ) {
    textColor.value =
      style.color;
  }
}


function setValue(
  selector,
  value
) {
  const element =
    $(selector);

  if (
    element &&
    value !== undefined
  ) {
    element.value =
      value;
  }
}


/* =========================================================
   PROPERTY UPDATES
========================================================= */

function updateSelectedProperty(
  path,
  value
) {
  const element =
    getSelectedElement();


  if (!element) {
    return;
  }


  pushHistory();


  if (
    path.startsWith("style.")
  ) {

    const property =
      path.slice(6);

    element.style[property] =
      value;

  } else {

    const property =
      path.slice(8);

    element.content[property] =
      value;
  }


  renderProject();

  saveProject();
}


function setupPropertyEvents() {

  bindInput(
    "#headingInput",
    value =>
      updateSelectedProperty(
        "content.heading",
        value
      )
  );


  bindInput(
    "#descriptionInput",
    value =>
      updateSelectedProperty(
        "content.description",
        value
      )
  );


  bindInput(
    "#buttonInput",
    value => {

      const element =
        getSelectedElement();

      if (!element) {
        return;
      }

      if (
        element.content.text !==
        undefined
      ) {

        updateSelectedProperty(
          "content.text",
          value
        );

      } else {

        updateSelectedProperty(
          "content.button",
          value
        );
      }
    }
  );


  bindInput(
    "#widthInput",
    value =>
      updateSelectedProperty(
        "style.width",
        value
      )
  );


  bindInput(
    "#heightInput",
    value =>
      updateSelectedProperty(
        "style.height",
        value
      )
  );


  bindInput(
    "#paddingInput",
    value =>
      updateSelectedProperty(
        "style.padding",
        value
      )
  );


  bindInput(
    "#marginInput",
    value =>
      updateSelectedProperty(
        "style.margin",
        value
      )
  );


  bindInput(
    "#fontInput",
    value =>
      updateSelectedProperty(
        "style.fontFamily",
        value
      )
  );


  bindInput(
    "#fontSizeInput",
    value =>
      updateSelectedProperty(
        "style.fontSize",
        value
      )
  );


  bindInput(
    "#fontWeightInput",
    value =>
      updateSelectedProperty(
        "style.fontWeight",
        value
      )
  );


  bindInput(
    "#backgroundColorText",
    value =>
      updateSelectedProperty(
        "style.background",
        value
      )
  );


  bindInput(
    "#textColorText",
    value =>
      updateSelectedProperty(
        "style.color",
        value
      )
  );


  bindInput(
    "#borderWidth",
    value =>
      updateSelectedProperty(
        "style.borderWidth",
        value
      )
  );


  bindInput(
    "#borderRadius",
    value =>
      updateSelectedProperty(
        "style.borderRadius",
        value
      )
  );


  const background =
    $("#backgroundColor");

  if (background) {

    background.addEventListener(
      "input",
      event => {

        const value =
          event.target.value;

        setValue(
          "#backgroundColorText",
          value
        );

        updateSelectedProperty(
          "style.background",
          value
        );
      }
    );
  }


  const textColor =
    $("#textColor");

  if (textColor) {

    textColor.addEventListener(
      "input",
      event => {

        const value =
          event.target.value;

        setValue(
          "#textColorText",
          value
        );

        updateSelectedProperty(
          "style.color",
          value
        );
      }
    );
  }
}


function bindInput(
  selector,
  callback
) {
  const element =
    $(selector);

  if (!element) {
    return;
  }


  element.addEventListener(
    "change",
    event => {
      callback(
        event.target.value
      );
    }
  );
}


/* =========================================================
   OBJECT LIST
========================================================= */

function setupObjectList() {

  $$(".object-item").forEach(
    item => {

      item.addEventListener(
        "click",
        () => {

          const type =
            item.dataset.object;

          if (!type) {
            return;
          }

          addObject(type);
        }
      );


      item.addEventListener(
        "dragstart",
        event => {

          event.dataTransfer.setData(
            "text/plain",
            item.dataset.object
          );

          LPB.state.isDragging =
            true;
        }
      );


      item.addEventListener(
        "dragend",
        () => {

          LPB.state.isDragging =
            false;
        }
      );
    }
  );


  const search =
    $("#objectSearch");


  if (search) {

    search.addEventListener(
      "input",
      event => {

        const query =
          event.target.value
            .trim()
            .toLowerCase();


        $$(".object-item").forEach(
          item => {

            const text =
              item.textContent
                .trim()
                .toLowerCase();


            item.style.display =
              !query ||
              text.includes(query)
                ? ""
                : "none";
          }
        );
      }
    );
  }
}


/* =========================================================
   ADD OBJECT
========================================================= */

function addObject(type) {

  const element =
    createElement(type);


  pushHistory();


  LPB.state.page.elements.push(
    element
  );


  LPB.state.selectedElement =
    element.id;


  renderProject();

  saveProject();
}


/* =========================================================
   DELETE OBJECT
========================================================= */

function deleteSelectedObject() {

  const id =
    LPB.state.selectedElement;


  if (!id) {
    return;
  }


  const index =
    LPB.state.page.elements.findIndex(
      element =>
        element.id === id
    );


  if (index === -1) {
    return;
  }


  pushHistory();


  LPB.state.page.elements.splice(
    index,
    1
  );


  LPB.state.selectedElement =
    null;


  renderProject();

  saveProject();
}


/* =========================================================
   CANVAS DRAG & DROP
========================================================= */

function setupCanvasDrop() {

  const canvas =
    $("#canvas");


  if (!canvas) {
    return;
  }


  canvas.addEventListener(
    "dragover",
    event => {

      event.preventDefault();
    }
  );


  canvas.addEventListener(
    "drop",
    event => {

      event.preventDefault();


      const type =
        event.dataTransfer
          .getData("text/plain");


      if (!type) {
        return;
      }


      addObject(type);
    }
  );
}


/* =========================================================
   ZOOM
========================================================= */

function applyZoom() {

  const canvas =
    $("#canvas");


  if (!canvas) {
    return;
  }


  canvas.style.transform =
    `scale(${LPB.state.zoom})`;

  canvas.style.transformOrigin =
    "top center";


  const zoom =
    $("#zoomValue");


  if (zoom) {

    zoom.textContent =
      `${Math.round(
        LPB.state.zoom * 100
      )}%`;
  }
}


function changeZoom(amount) {

  LPB.state.zoom +=
    amount;


  LPB.state.zoom =
    Math.max(
      0.25,
      Math.min(
        2,
        LPB.state.zoom
      )
    );


  applyZoom();
}


function setupZoom() {

  const zoomIn =
    $("#zoomIn");

  const zoomOut =
    $("#zoomOut");

  const zoomReset =
    $("#zoomReset");


  if (zoomIn) {

    zoomIn.addEventListener(
      "click",
      () => changeZoom(.1)
    );
  }


  if (zoomOut) {

    zoomOut.addEventListener(
      "click",
      () => changeZoom(-.1)
    );
  }


  if (zoomReset) {

    zoomReset.addEventListener(
      "click",
      () => {

        LPB.state.zoom =
          1;

        applyZoom();
      }
    );
  }
}


/* =========================================================
   DEVICE PREVIEW
========================================================= */

function applyDevice() {

  const canvas =
    $("#canvas");


  if (!canvas) {
    return;
  }


  switch (
    LPB.state.device
  ) {

    case "mobile":

      canvas.style.width =
        "390px";

      break;


    case "tablet":

      canvas.style.width =
        "768px";

      break;


    case "desktop":

    default:

      canvas.style.width =
        "1000px";

      break;
  }
}


function setupDeviceButtons() {

  $$(
    "[data-device]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          LPB.state.device =
            button.dataset.device;


          $$(
            "[data-device]"
          ).forEach(
            item => {

              item.classList.toggle(
                "active",

                item === button
              );
            }
          );


          applyDevice();
        }
      );
    }
  );
}


/* =========================================================
   TOOLBAR
========================================================= */

function setupTools() {

  const tools = [
    [
      "#selectTool",
      "select"
    ],

    [
      "#moveTool",
      "move"
    ],

    [
      "#textTool",
      "text"
    ]
  ];


  tools.forEach(
    ([selector, tool]) => {

      const button =
        $(selector);


      if (!button) {
        return;
      }


      button.addEventListener(
        "click",
        () => {

          LPB.state.tool =
            tool;


          tools.forEach(
            ([otherSelector]) => {

              const other =
                $(otherSelector);

              if (other) {

                other.classList.toggle(
                  "active",

                  other === button
                );
              }
            }
          );
        }
      );
    }
  );
}


/* =========================================================
   OBJECT COUNT
========================================================= */

function updateObjectCount() {

  const element =
    $("#objectCount");


  if (!element) {
    return;
  }


  const count =
    LPB.state.page.elements.length;


  element.textContent =
    `${count} ${
      count === 1
        ? "object"
        : "objects"
    }`;
}


/* =========================================================
   CURSOR POSITION
========================================================= */

function setupCursorPosition() {

  const canvas =
    $("#canvas");


  const output =
    $("#cursorPosition");


  if (
    !canvas ||
    !output
  ) {
    return;
  }


  canvas.addEventListener(
    "mousemove",
    event => {

      const rect =
        canvas.getBoundingClientRect();


      const x =
        Math.max(
          0,
          Math.round(
            (event.clientX -
              rect.left) /
            LPB.state.zoom
          )
        );


      const y =
        Math.max(
          0,
          Math.round(
            (event.clientY -
              rect.top) /
            LPB.state.zoom
          )
        );


      output.textContent =
        `${x} × ${y}`;
    }
  );
}


/* =========================================================
   PREVIEW
========================================================= */

function openPreview() {

  const project =
    cloneData(
      LPB.state.page
    );


  localStorage.setItem(
    "lpb_preview_project",
    JSON.stringify(project)
  );


  window.open(
    "preview.html",
    "_blank"
  );
}


/* =========================================================
   EXPORT
========================================================= */

function exportProject() {

  const project =
    cloneData(
      LPB.state.page
    );


  const data =
    JSON.stringify(
      project,
      null,
      2
    );


  downloadBlob(
    data,
    "lpb-project.json",
    "application/json"
  );
}


function downloadBlob(
  content,
  filename,
  type
) {
  const blob =
    new Blob(
      [content],
      { type }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement("a");


  link.href =
    url;

  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      /*
       * Ctrl + Z
       */

      if (
        event.ctrlKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z"
      ) {

        event.preventDefault();

        undo();

        return;
      }


      /*
       * Ctrl + Shift + Z
       */

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "z"
      ) {

        event.preventDefault();

        redo();

        return;
      }


      /*
       * Delete
       */

      if (
        event.key === "Delete"
      ) {

        const active =
          document.activeElement;


        const typing =
          active &&
          (
            active.tagName ===
              "INPUT" ||
            active.tagName ===
              "TEXTAREA" ||
            active.tagName ===
              "SELECT"
          );


        if (!typing) {

          deleteSelectedObject();
        }
      }
    }
  );
}


/* =========================================================
   TOP BUTTONS
========================================================= */

function setupTopButtons() {

  const undoButton =
    $("#undoButton");


  const redoButton =
    $("#redoButton");


  const previewButton =
    $("#previewButton");


  const exportButton =
    $("#exportButton");


  if (undoButton) {

    undoButton.addEventListener(
      "click",
      undo
    );
  }


  if (redoButton) {

    redoButton.addEventListener(
      "click",
      redo
    );
  }


  if (previewButton) {

    previewButton.addEventListener(
      "click",
      openPreview
    );
  }


  if (exportButton) {

    exportButton.addEventListener(
      "click",
      exportProject
    );
  }
}


/* =========================================================
   UTILITIES
========================================================= */

function capitalize(text) {

  if (!text) {
    return "";
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}


function isColor(value) {

  if (
    typeof value !== "string"
  ) {
    return false;
  }


  return /^#[0-9a-f]{6}$/i.test(
    value.trim()
  );
}


/* =========================================================
   DASHBOARD SUPPORT
========================================================= */

function setupDashboard() {

  const createButtons =
    $$("[data-create-project]");


  createButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const project =
            createDefaultProject();


          localStorage.setItem(
            LPB.storage.project,
            JSON.stringify(project)
          );


          window.location.href =
            "build.html";
        }
      );
    }
  );
}


/* =========================================================
   DOWNLOADS SUPPORT
========================================================= */

function setupDownloads() {

  const openBuilder =
    $("#openBuilder");


  if (openBuilder) {

    openBuilder.addEventListener(
      "click",
      () => {

        window.location.href =
          "build.html";
      }
    );
  }


  const downloadCurrent =
    $("#downloadCurrent");


  if (downloadCurrent) {

    downloadCurrent.addEventListener(
      "click",
      exportProject
    );
  }


  $$(".download-file").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const filename =
            button.dataset.file ||
            "lpb-project.json";


          exportProjectAs(
            filename
          );
        }
      );
    }
  );


  $$(
    ".format-button"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const format =
            button.dataset.format;


          exportFormat(
            format
          );
        }
      );
    }
  );


  $$(
    '[data-action="delete"]'
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            button.closest(
              ".download-item"
            );


          if (item) {
            item.remove();
          }


          updateDownloadEmptyState();
        }
      );
    }
  );
}


function exportProjectAs(
  filename
) {

  const project =
    cloneData(
      LPB.state.page
    );


  const content =
    JSON.stringify(
      project,
      null,
      2
    );


  downloadBlob(
    content,
    filename.endsWith(".json")
      ? filename
      : "lpb-project.json",
    "application/json"
  );
}


function exportFormat(format) {

  switch (format) {

    case "html":

      exportHTML();

      break;


    case "json":

      exportProject();

      break;


    case "zip":

      /*
       * ZIP generation will be handled
       * by app-post.js.
       */

      if (
        typeof window.LPBExportZip ===
        "function"
      ) {

        window.LPBExportZip();
      } else {

        exportProject();
      }

      break;
  }
}


function exportHTML() {

  const canvas =
    $("#canvas");


  if (!canvas) {
    return;
  }


  const html =
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(
    LPB.state.page.name
  )}</title>
</head>
<body>
${canvas.innerHTML}
</body>
</html>`;


  downloadBlob(
    html,
    "landing-page.html",
    "text/html"
  );
}


function updateDownloadEmptyState() {

  const list =
    $("#downloadList");


  const empty =
    $("#emptyState");


  if (
    !list ||
    !empty
  ) {
    return;
  }


  const hasItems =
    list.querySelector(
      ".download-item"
    );


  empty.style.display =
    hasItems
      ? "none"
      : "block";
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   PAGE DETECTION
========================================================= */

function detectPage() {

  const path =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  return path || "index.html";
}


/* =========================================================
   INITIALIZE BUILDER
========================================================= */

function initializeBuilder() {

  const existing =
    loadProject();


  if (!existing) {

    LPB.state.page =
      createDefaultProject();

    saveProject();
  }


  pushHistory();


  renderProject();

  setupObjectList();

  setupCanvasDrop();

  setupPropertyEvents();

  setupZoom();

  setupDeviceButtons();

  setupTools();

  setupCursorPosition();

  setupTopButtons();

  setupKeyboard();
}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

function initializeLPB() {

  const page =
    detectPage();


  switch (page) {

    case "build.html":

      initializeBuilder();

      break;


    case "dashboard.html":

      setupDashboard();

      break;


    case "downloads.html":

      /*
       * Load existing project so
       * downloads page can export it.
       */

      loadProject();

      setupDownloads();

      break;


    default:

      /*
       * Landing page doesn't need
       * builder initialization.
       */

      break;
  }
}


/* =========================================================
   START
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeLPB
  );

} else {

  initializeLPB();
}


/* =========================================================
   PUBLIC API
========================================================= */

window.LPB = LPB;

window.LPBAddObject =
  addObject;

window.LPBDeleteObject =
  deleteSelectedObject;

window.LPBSave =
  saveProject;

window.LPBExport =
  exportProject;

window.LPBUndo =
  undo;

window.LPBRedo =
  redo;
