/*
 * LPB — Landing Page Builder
 * app-post.js
 *
 * Post-processing, exporting, importing,
 * downloads, preview generation and utilities.
 */

"use strict";


/* =========================================================
   LPB POST CONFIG
========================================================= */

const LPBPost = {

  version: "1.0.0",

  storage: {
    project: "lpb_project",
    downloads: "lpb_downloads",
    preview: "lpb_preview_project"
  },

  maxDownloads: 25

};


/* =========================================================
   BASIC HELPERS
========================================================= */

function post$(selector, parent = document) {
  return parent.querySelector(selector);
}


function post$$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}


function postEscapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function postCreateId(prefix = "lpb") {

  return (
    prefix +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );
}


/* =========================================================
   TOAST
========================================================= */

function createToastContainer() {

  let container =
    post$("#lpbToastContainer");

  if (container) {
    return container;
  }


  container =
    document.createElement("div");

  container.id =
    "lpbToastContainer";


  container.style.position =
    "fixed";

  container.style.right =
    "20px";

  container.style.bottom =
    "20px";

  container.style.zIndex =
    "99999";

  container.style.display =
    "flex";

  container.style.flexDirection =
    "column";

  container.style.gap =
    "8px";


  document.body.appendChild(
    container
  );


  return container;
}


function showToast(
  message,
  type = "info"
) {

  const container =
    createToastContainer();


  const toast =
    document.createElement("div");


  toast.textContent =
    message;


  toast.style.padding =
    "11px 14px";

  toast.style.border =
    "1px solid rgba(255,255,255,.1)";

  toast.style.borderRadius =
    "8px";

  toast.style.background =
    "#111";

  toast.style.color =
    "#fff";

  toast.style.fontSize =
    "12px";

  toast.style.fontWeight =
    "700";

  toast.style.boxShadow =
    "0 10px 35px rgba(0,0,0,.35)";

  toast.style.opacity =
    "0";

  toast.style.transform =
    "translateY(8px)";

  toast.style.transition =
    "opacity .2s ease, transform .2s ease";


  if (type === "success") {
    toast.style.borderColor =
      "rgba(255,255,255,.22)";
  }


  if (type === "error") {
    toast.style.borderColor =
      "rgba(255,80,80,.35)";
  }


  container.appendChild(
    toast
  );


  requestAnimationFrame(() => {

    toast.style.opacity =
      "1";

    toast.style.transform =
      "translateY(0)";
  });


  setTimeout(() => {

    toast.style.opacity =
      "0";

    toast.style.transform =
      "translateY(8px)";

    setTimeout(
      () => toast.remove(),
      250
    );

  }, 2500);
}


/* =========================================================
   PROJECT DATA
========================================================= */

function getPostProject() {

  try {

    const raw =
      localStorage.getItem(
        LPBPost.storage.project
      );


    if (!raw) {
      return null;
    }


    const project =
      JSON.parse(raw);


    if (
      !project ||
      typeof project !== "object"
    ) {
      return null;
    }


    if (
      !Array.isArray(
        project.elements
      )
    ) {
      project.elements = [];
    }


    return project;

  } catch (error) {

    console.error(
      "LPB: Invalid project data",
      error
    );

    return null;
  }
}


function savePostProject(
  project
) {

  localStorage.setItem(
    LPBPost.storage.project,
    JSON.stringify(project)
  );
}


/* =========================================================
   DOWNLOAD HISTORY
========================================================= */

function getDownloadHistory() {

  try {

    const raw =
      localStorage.getItem(
        LPBPost.storage.downloads
      );


    if (!raw) {
      return [];
    }


    const data =
      JSON.parse(raw);


    return Array.isArray(data)
      ? data
      : [];

  } catch {
    return [];
  }
}


function saveDownloadHistory(
  history
) {

  const trimmed =
    history.slice(
      0,
      LPBPost.maxDownloads
    );


  localStorage.setItem(
    LPBPost.storage.downloads,
    JSON.stringify(trimmed)
  );
}


function addDownloadRecord({
  filename,
  format,
  size = 0
}) {

  const history =
    getDownloadHistory();


  history.unshift({

    id:
      postCreateId("download"),

    filename,

    format,

    size,

    date:
      new Date().toISOString()

  });


  saveDownloadHistory(
    history
  );
}


/* =========================================================
   BLOB DOWNLOAD
========================================================= */

function postDownloadBlob(
  data,
  filename,
  mime
) {

  const blob =
    data instanceof Blob
      ? data
      : new Blob(
          [data],
          { type: mime }
        );


  const url =
    URL.createObjectURL(
      blob
    );


  const anchor =
    document.createElement("a");


  anchor.href =
    url;

  anchor.download =
    filename;

  anchor.style.display =
    "none";


  document.body.appendChild(
    anchor
  );


  anchor.click();


  anchor.remove();


  setTimeout(() => {

    URL.revokeObjectURL(
      url
    );

  }, 1000);


  addDownloadRecord({

    filename,

    format:
      mime,

    size:
      blob.size

  });


  showToast(
    `${filename} downloaded`,
    "success"
  );
}


/* =========================================================
   HTML GENERATOR
========================================================= */

function generateDocumentHTML(
  project
) {

  const title =
    postEscapeHTML(
      project.name ||
      "Landing Page"
    );


  const body =
    generateProjectBody(
      project
    );


  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="${postEscapeHTML(
      project.description ||
      "Landing page created with LPB."
    )}"
  >

  <title>${title}</title>

  <style>

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      padding: 0;

      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      background: #ffffff;
      color: #111111;
    }

    img,
    video {
      max-width: 100%;
    }

    button,
    input {
      font: inherit;
    }

    a {
      color: inherit;
    }

    .lpb-object {
      position: relative;
    }

    .lpb-hero {
      display: flex;
      flex-direction: column;

      justify-content: center;
      align-items: flex-start;
    }

    .lpb-hero h1 {
      margin: 0;

      max-width: 900px;

      line-height: 1.05;
      letter-spacing: -2px;
    }

    .lpb-hero p {
      max-width: 650px;

      margin: 18px 0;

      line-height: 1.7;
    }

    .lpb-button {
      display: inline-flex;

      align-items: center;
      justify-content: center;

      padding: 11px 18px;

      border: 0;
      border-radius: 7px;

      background: #111111;
      color: #ffffff;

      text-decoration: none;

      cursor: pointer;
    }

    .lpb-navbar {
      display: flex;

      align-items: center;
      justify-content: space-between;
    }

    .lpb-navbar-links {
      display: flex;

      gap: 20px;
    }

    .lpb-features {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 20px;
    }

    .lpb-feature {
      padding: 25px;

      border-radius: 10px;

      background: #f5f5f5;
    }

    .lpb-pricing {
      text-align: center;
    }

    .lpb-price {
      display: block;

      margin: 18px 0;

      font-size: 42px;

      font-weight: 800;
    }

    .lpb-testimonial {
      max-width: 800px;

      margin: auto;

      text-align: center;
    }

    .lpb-testimonial blockquote {
      margin: 0;

      font-size: 24px;

      line-height: 1.5;
    }

    .lpb-form {
      display: flex;

      flex-direction: column;

      align-items: center;

      gap: 12px;
    }

    .lpb-form input {
      width: min(100%, 360px);

      height: 42px;

      padding: 0 12px;

      border:
        1px solid #dddddd;

      border-radius: 7px;
    }

    @media (max-width: 700px) {

      .lpb-features {
        grid-template-columns: 1fr;
      }

      .lpb-navbar {
        flex-direction: column;

        gap: 15px;
      }

      .lpb-navbar-links {
        flex-wrap: wrap;

        justify-content: center;
      }

    }

  </style>
</head>

<body>

${body}

</body>
</html>`;
}


/* =========================================================
   STYLE SERIALIZATION
========================================================= */

function postStyle(
  style = {}
) {

  const output = [];


  if (style.background) {
    output.push(
      `background:${postEscapeHTML(
        style.background
      )}`
    );
  }


  if (style.color) {
    output.push(
      `color:${postEscapeHTML(
        style.color
      )}`
    );
  }


  if (style.width) {
    output.push(
      `width:${postEscapeHTML(
        style.width
      )}`
    );
  }


  if (style.height) {
    output.push(
      `min-height:${postEscapeHTML(
        style.height
      )}`
    );
  }


  if (style.padding) {
    output.push(
      `padding:${postEscapeHTML(
        style.padding
      )}`
    );
  }


  if (style.margin) {
    output.push(
      `margin:${postEscapeHTML(
        style.margin
      )}`
    );
  }


  if (style.fontFamily) {
    output.push(
      `font-family:${postEscapeHTML(
        style.fontFamily
      )}`
    );
  }


  if (style.fontSize) {
    output.push(
      `font-size:${postEscapeHTML(
        style.fontSize
      )}`
    );
  }


  if (style.fontWeight) {
    output.push(
      `font-weight:${postEscapeHTML(
        style.fontWeight
      )}`
    );
  }


  if (style.borderWidth) {

    output.push(
      `border:${postEscapeHTML(
        style.borderWidth
      )} solid currentColor`
    );
  }


  if (style.borderRadius) {

    output.push(
      `border-radius:${postEscapeHTML(
        style.borderRadius
      )}`
    );
  }


  return output.join(";");
}


/* =========================================================
   OBJECT HTML
========================================================= */

function generateProjectBody(
  project
) {

  const elements =
    Array.isArray(project.elements)
      ? project.elements
      : [];


  return elements
    .map(
      element =>
        generateObjectHTML(
          element
        )
    )
    .join("\n");
}


function generateObjectHTML(
  element
) {

  const style =
    postStyle(
      element.style
    );


  const content =
    element.content || {};


  switch (element.type) {

    case "hero":

      return `
<section
  class="lpb-object lpb-hero"
  style="${style}"
>
  <h1>
    ${postEscapeHTML(
      content.heading ||
      "Your Heading"
    )}
  </h1>

  <p>
    ${postEscapeHTML(
      content.description ||
      ""
    )}
  </p>

  ${
    content.button
      ? `
  <a
    class="lpb-button"
    href="#"
  >
    ${postEscapeHTML(
      content.button
    )}
  </a>
  `
      : ""
  }
</section>`;


    case "heading":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  <h2>
    ${postEscapeHTML(
      content.text ||
      "Heading"
    )}
  </h2>
</section>`;


    case "text":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  <p>
    ${postEscapeHTML(
      content.text ||
      ""
    )}
  </p>
</section>`;


    case "button":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  <a
    class="lpb-button"
    href="${postEscapeHTML(
      content.url ||
      "#"
    )}"
  >
    ${postEscapeHTML(
      content.text ||
      "Button"
    )}
  </a>
</section>`;


    case "image":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  ${
    content.src
      ? `
  <img
    src="${postEscapeHTML(
      content.src
    )}"
    alt="${postEscapeHTML(
      content.alt ||
      "Image"
    )}"
  >
  `
      : ""
  }
</section>`;


    case "video":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  ${
    content.src
      ? `
  <video
    src="${postEscapeHTML(
      content.src
    )}"
    controls
  ></video>
  `
      : ""
  }
</section>`;


    case "navbar":

      return `
<nav
  class="lpb-object lpb-navbar"
  style="${style}"
>
  <strong>
    ${postEscapeHTML(
      content.logo ||
      "Logo"
    )}
  </strong>

  <div class="lpb-navbar-links">

    ${
      (
        content.links || []
      )
        .map(
          link => `
      <a href="#">
        ${postEscapeHTML(
          link
        )}
      </a>
      `
        )
        .join("")
    }

  </div>
</nav>`;


    case "features":

      return `
<section
  class="lpb-object"
  style="${style}"
>

  <h2>
    ${postEscapeHTML(
      content.title ||
      "Features"
    )}
  </h2>

  <div class="lpb-features">

    ${
      (
        content.items || []
      )
        .map(
          item => `
      <article class="lpb-feature">
        ${postEscapeHTML(
          item
        )}
      </article>
      `
        )
        .join("")
    }

  </div>

</section>`;


    case "pricing":

      return `
<section
  class="lpb-object lpb-pricing"
  style="${style}"
>

  <h2>
    ${postEscapeHTML(
      content.title ||
      "Pricing"
    )}
  </h2>

  <span class="lpb-price">
    ${postEscapeHTML(
      content.price ||
      "$0"
    )}
  </span>

  <a
    class="lpb-button"
    href="#"
  >
    ${postEscapeHTML(
      content.button ||
      "Choose Plan"
    )}
  </a>

</section>`;


    case "testimonials":

      return `
<section
  class="lpb-object lpb-testimonial"
  style="${style}"
>

  <blockquote>
    "${postEscapeHTML(
      content.quote ||
      ""
    )}"
  </blockquote>

  <p>
    ${postEscapeHTML(
      content.author ||
      "Customer"
    )}
  </p>

</section>`;


    case "footer":

      return `
<footer
  class="lpb-object"
  style="${style}"
>
  ${postEscapeHTML(
    content.text ||
    "© 2026"
  )}
</footer>`;


    case "input":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  <input
    placeholder="${postEscapeHTML(
      content.placeholder ||
      ""
    )}"
  >
</section>`;


    case "form":

      return `
<section
  class="lpb-object"
  style="${style}"
>

  <form class="lpb-form">

    <h2>
      ${postEscapeHTML(
        content.title ||
        "Contact Us"
      )}
    </h2>

    <input
      type="email"
      placeholder="Your email"
    >

    <button
      class="lpb-button"
      type="submit"
    >
      ${postEscapeHTML(
        content.button ||
        "Submit"
      )}
    </button>

  </form>

</section>`;


    case "link":

      return `
<section
  class="lpb-object"
  style="${style}"
>
  <a
    href="${postEscapeHTML(
      content.url ||
      "#"
    )}"
  >
    ${postEscapeHTML(
      content.text ||
      "Learn More"
    )}
  </a>
</section>`;


    case "container":

      return `
<section
  class="lpb-object"
  style="${style}"
>
</section>`;


    case "section":

    default:

      return `
<section
  class="lpb-object"
  style="${style}"
>
</section>`;
  }
}


/* =========================================================
   EXPORT HTML
========================================================= */

function postExportHTML() {

  const project =
    getPostProject();


  if (!project) {

    showToast(
      "No project found",
      "error"
    );

    return;
  }


  const html =
    generateDocumentHTML(
      project
    );


  const filename =
    sanitizeFilename(
      project.name ||
      "landing-page"
    ) +
    ".html";


  postDownloadBlob(
    html,
    filename,
    "text/html;charset=utf-8"
  );
}


/* =========================================================
   EXPORT JSON
========================================================= */

function postExportJSON() {

  const project =
    getPostProject();


  if (!project) {

    showToast(
      "No project found",
      "error"
    );

    return;
  }


  const json =
    JSON.stringify(
      project,
      null,
      2
    );


  const filename =
    sanitizeFilename(
      project.name ||
      "lpb-project"
    ) +
    ".json";


  postDownloadBlob(
    json,
    filename,
    "application/json"
  );
}


/* =========================================================
   SANITIZE FILENAME
========================================================= */

function sanitizeFilename(
  filename
) {

  return String(filename)
    .trim()
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .slice(0, 80)
    || "lpb-project";
}


/* =========================================================
   SIMPLE ZIP WRITER
========================================================= */

/*
 * Minimal ZIP implementation.
 *
 * Supports:
 * - Store method
 * - Multiple files
 * - No external dependency
 */

function crc32(buffer) {

  let crc =
    0xffffffff;


  for (
    let i = 0;
    i < buffer.length;
    i++
  ) {

    crc ^=
      buffer[i];


    for (
      let j = 0;
      j < 8;
      j++
    ) {

      crc =
        (
          crc >>> 1
        ) ^
        (
          0xedb88320 &
          -(
            crc & 1
          )
        );
    }
  }


  return (
    crc ^
    0xffffffff
  ) >>> 0;
}


function writeUInt16(
  array,
  offset,
  value
) {

  array[offset] =
    value & 0xff;

  array[offset + 1] =
    (value >>> 8) & 0xff;
}


function writeUInt32(
  array,
  offset,
  value
) {

  array[offset] =
    value & 0xff;

  array[offset + 1] =
    (value >>> 8) & 0xff;

  array[offset + 2] =
    (value >>> 16) & 0xff;

  array[offset + 3] =
    (value >>> 24) & 0xff;
}


function utf8Bytes(
  text
) {

  return new TextEncoder()
    .encode(text);
}


function createZip(
  files
) {

  const localParts = [];
  const centralParts = [];

  let offset = 0;


  files.forEach(file => {

    const name =
      utf8Bytes(
        file.name
      );


    const data =
      typeof file.data ===
      "string"
        ? utf8Bytes(file.data)
        : file.data;


    const crc =
      crc32(data);


    const local =
      new Uint8Array(
        30 +
        name.length +
        data.length
      );


    writeUInt32(
      local,
      0,
      0x04034b50
    );


    writeUInt16(
      local,
      4,
      20
    );


    writeUInt16(
      local,
      6,
      0
    );


    writeUInt16(
      local,
      8,
      0
    );


    writeUInt16(
      local,
      10,
      0
    );


    writeUInt16(
      local,
      12,
      0
    );


    writeUInt32(
      local,
      14,
      crc
    );


    writeUInt32(
      local,
      18,
      data.length
    );


    writeUInt32(
      local,
      22,
      data.length
    );


    writeUInt16(
      local,
      26,
      name.length
    );


    writeUInt16(
      local,
      28,
      0
    );


    local.set(
      name,
      30
    );


    local.set(
      data,
      30 + name.length
    );


    localParts.push(
      local
    );


    const central =
      new Uint8Array(
        46 +
        name.length
      );


    writeUInt32(
      central,
      0,
      0x02014b50
    );


    writeUInt16(
      central,
      4,
      20
    );


    writeUInt16(
      central,
      6,
      20
    );


    writeUInt16(
      central,
      8,
      0
    );


    writeUInt16(
      central,
      10,
      0
    );


    writeUInt16(
      central,
      12,
      0
    );


    writeUInt16(
      central,
      14,
      0
    );


    writeUInt32(
      central,
      16,
      crc
    );


    writeUInt32(
      central,
      20,
      data.length
    );


    writeUInt32(
      central,
      24,
      data.length
    );


    writeUInt16(
      central,
      28,
      name.length
    );


    writeUInt16(
      central,
      30,
      0
    );


    writeUInt16(
      central,
      32,
      0
    );


    writeUInt16(
      central,
      34,
      0
    );


    writeUInt16(
      central,
      36,
      0
    );


    writeUInt32(
      central,
      38,
      0
    );


    writeUInt32(
      central,
      42,
      offset
    );


    central.set(
      name,
      46
    );


    centralParts.push(
      central
    );


    offset +=
      local.length;

  });


  const centralOffset =
    offset;


  const centralSize =
    centralParts.reduce(
      (
        total,
        part
      ) =>
        total + part.length,
      0
    );


  const end =
    new Uint8Array(22);


  writeUInt32(
    end,
    0,
    0x06054b50
  );


  writeUInt16(
    end,
    4,
    0
  );


  writeUInt16(
    end,
    6,
    0
  );


  writeUInt16(
    end,
    8,
    files.length
  );


  writeUInt16(
    end,
    10,
    files.length
  );


  writeUInt32(
    end,
    12,
    centralSize
  );


  writeUInt32(
    end,
    16,
    centralOffset
  );


  writeUInt16(
    end,
    20,
    0
  );


  const totalSize =
    localParts.reduce(
      (
        total,
        part
      ) =>
        total + part.length,
      0
    ) +
    centralSize +
    end.length;


  const zip =
    new Uint8Array(
      totalSize
    );


  let position = 0;


  localParts.forEach(
    part => {

      zip.set(
        part,
        position
      );

      position +=
        part.length;
    }
  );


  centralParts.forEach(
    part => {

      zip.set(
        part,
        position
      );

      position +=
        part.length;
    }
  );


  zip.set(
    end,
    position
  );


  return zip;
}


/* =========================================================
   EXPORT ZIP
========================================================= */

function postExportZip() {

  const project =
    getPostProject();


  if (!project) {

    showToast(
      "No project found",
      "error"
    );

    return;
  }


  const html =
    generateDocumentHTML(
      project
    );


  const json =
    JSON.stringify(
      project,
      null,
      2
    );


  const readme =
`# ${project.name || "LPB Project"}

Created with LPB — Landing Page Builder.

Files:
- index.html
- project.json
- README.md
`;


  const files = [

    {
      name: "index.html",
      data: html
    },

    {
      name: "project.json",
      data: json
    },

    {
      name: "README.md",
      data: readme
    }

  ];


  const zip =
    createZip(files);


  const filename =
    sanitizeFilename(
      project.name ||
      "landing-page"
    ) +
    ".zip";


  postDownloadBlob(
    zip,
    filename,
    "application/zip"
  );
}


/* =========================================================
   EXPOSE ZIP FUNCTION
========================================================= */

window.LPBExportZip =
  postExportZip;


/* =========================================================
   PREVIEW
========================================================= */

function postOpenPreview() {

  const project =
    getPostProject();


  if (!project) {

    showToast(
      "No project to preview",
      "error"
    );

    return;
  }


  localStorage.setItem(
    LPBPost.storage.preview,
    JSON.stringify(project)
  );


  const html =
    generateDocumentHTML(
      project
    );


  const blob =
    new Blob(
      [html],
      {
        type:
          "text/html;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  window.open(
    url,
    "_blank"
  );


  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    60000
  );
}


/* =========================================================
   IMPORT PROJECT
========================================================= */

function importProjectFile(
  file
) {

  if (!file) {
    return;
  }


  if (
    !file.name
      .toLowerCase()
      .endsWith(".json")
  ) {

    showToast(
      "Please select a .json project",
      "error"
    );

    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    event => {

      try {

        const project =
          JSON.parse(
            event.target.result
          );


        if (
          !project ||
          typeof project !==
            "object"
        ) {
          throw new Error(
            "Invalid project"
          );
        }


        if (
          !Array.isArray(
            project.elements
          )
        ) {

          project.elements =
            [];
        }


        if (
          !project.name
        ) {

          project.name =
            "Imported Project";
        }


        savePostProject(
          project
        );


        showToast(
          "Project imported successfully",
          "success"
        );


        setTimeout(
          () => {

            if (
              location.pathname
                .endsWith(
                  "build.html"
                )
            ) {

              location.reload();

            } else {

              location.href =
                "build.html";
            }

          },
          500
        );

      } catch (error) {

        console.error(
          error
        );

        showToast(
          "Invalid LPB project file",
          "error"
        );
      }
    };


  reader.readAsText(
    file
  );
}


/* =========================================================
   IMPORT BUTTON
========================================================= */

function setupImport() {

  const input =
    post$("#projectImport");


  const button =
    post$("#importButton");


  if (
    !input ||
    !button
  ) {
    return;
  }


  button.addEventListener(
    "click",
    () => input.click()
  );


  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];


      importProjectFile(
        file
      );


      input.value =
        "";
    }
  );
}


/* =========================================================
   DOWNLOADS PAGE
========================================================= */

function renderDownloadHistory() {

  const list =
    post$("#downloadList");


  if (!list) {
    return;
  }


  const history =
    getDownloadHistory();


  if (!history.length) {
    return;
  }


  list.innerHTML =
    "";


  history.forEach(
    item => {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "download-item";


      const size =
        formatBytes(
          item.size
        );


      article.innerHTML = `

        <div class="file-icon">
          ${postEscapeHTML(
            getFileExtension(
              item.filename
            )
          )}
        </div>

        <div class="file-info">

          <div class="file-name">
            ${postEscapeHTML(
              item.filename
            )}
          </div>

          <div class="file-meta">

            <span>
              ${postEscapeHTML(
                item.format ||
                "File"
              )}
            </span>

            <span>
              •
            </span>

            <span>
              ${size}
            </span>

            <span class="file-status">
              <span class="status-dot"></span>
              Ready
            </span>

          </div>

        </div>

        <div class="file-actions">

          <button
            class="small-button"
            data-redownload="${postEscapeHTML(
              item.id
            )}"
          >
            Export Again
          </button>

          <button
            class="small-button"
            data-remove-download="${postEscapeHTML(
              item.id
            )}"
          >
            Remove
          </button>

        </div>

      `;


      list.appendChild(
        article
      );
    }
  );


  setupDownloadHistoryEvents();
}


function setupDownloadHistoryEvents() {

  post$$(
    "[data-remove-download]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset
              .removeDownload;


          let history =
            getDownloadHistory();


          history =
            history.filter(
              item =>
                item.id !== id
            );


          saveDownloadHistory(
            history
          );


          renderDownloadHistory();

          showToast(
            "Download removed"
          );
        }
      );
    }
  );


  post$$(
    "[data-redownload]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset
              .redownload;


          const item =
            getDownloadHistory()
              .find(
                entry =>
                  entry.id === id
              );


          if (!item) {
            return;
          }


          if (
            item.filename
              .toLowerCase()
              .endsWith(".html")
          ) {

            postExportHTML();

          } else if (
            item.filename
              .toLowerCase()
              .endsWith(".zip")
          ) {

            postExportZip();

          } else {

            postExportJSON();
          }
        }
      );
    }
  );
}


/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatBytes(
  bytes
) {

  if (
    !bytes ||
    bytes <= 0
  ) {
    return "0 KB";
  }


  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];


  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );


  const value =
    bytes /
    Math.pow(
      1024,
      index
    );


  return (
    value.toFixed(
      index === 0
        ? 0
        : 1
    ) +
    " " +
    units[
      index
    ]
  );
}


function getFileExtension(
  filename
) {

  const parts =
    String(filename)
      .split(".");


  return (
    parts.length > 1
      ? parts.pop()
      : "FILE"
  )
    .slice(0, 5)
    .toUpperCase();
}


/* =========================================================
   COPY PROJECT JSON
========================================================= */

async function copyProjectJSON() {

  const project =
    getPostProject();


  if (!project) {

    showToast(
      "No project found",
      "error"
    );

    return;
  }


  const json =
    JSON.stringify(
      project,
      null,
      2
    );


  try {

    await navigator.clipboard
      .writeText(json);


    showToast(
      "Project JSON copied",
      "success"
    );

  } catch {

    showToast(
      "Clipboard access failed",
      "error"
    );
  }
}


/* =========================================================
   RESET PROJECT
========================================================= */

function resetProject() {

  const confirmed =
    window.confirm(
      "Delete the current LPB project?"
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    LPBPost.storage.project
  );


  localStorage.removeItem(
    LPBPost.storage.preview
  );


  showToast(
    "Project reset",
    "success"
  );


  setTimeout(
    () => {

      window.location.href =
        "build.html";

    },
    400
  );
}


/* =========================================================
   SETUP EXPORT BUTTONS
========================================================= */

function setupPostButtons() {

  post$$(
    "[data-export]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const format =
            button.dataset.export;


          switch (format) {

            case "html":
              postExportHTML();
              break;

            case "json":
              postExportJSON();
              break;

            case "zip":
              postExportZip();
              break;

            default:
              break;
          }
        }
      );
    }
  );


  const preview =
    post$("#previewButton");


  if (preview) {

    preview.addEventListener(
      "click",
      postOpenPreview
    );
  }


  const copy =
    post$("#copyProject");


  if (copy) {

    copy.addEventListener(
      "click",
      copyProjectJSON
    );
  }


  const reset =
    post$("#resetProject");


  if (reset) {

    reset.addEventListener(
      "click",
      resetProject
    );
  }
}


/* =========================================================
   PROJECT NAME
========================================================= */

function setupProjectName() {

  const input =
    post$("#projectName");


  if (!input) {
    return;
  }


  const project =
    getPostProject();


  if (project) {

    input.value =
      project.name ||
      "Untitled Landing Page";
  }


  input.addEventListener(
    "change",
    () => {

      const current =
        getPostProject();


      if (!current) {
        return;
      }


      current.name =
        input.value.trim() ||
        "Untitled Landing Page";


      savePostProject(
        current
      );


      showToast(
        "Project name saved",
        "success"
      );
    }
  );
}


/* =========================================================
   AUTOSAVE
========================================================= */

function setupPostAutosave() {

  setInterval(
    () => {

      const project =
        getPostProject();


      if (!project) {
        return;
      }


      savePostProject(
        project
      );

    },
    5000
  );
}


/* =========================================================
   KEYBOARD EXPORT SHORTCUTS
========================================================= */

function setupPostKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      /*
       * Ctrl + S
       */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "s"
      ) {

        event.preventDefault();

        postExportJSON();

        return;
      }


      /*
       * Ctrl + Shift + E
       */

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "e"
      ) {

        event.preventDefault();

        postExportZip();

        return;
      }
    }
  );
}


/* =========================================================
   PAGE INITIALIZER
========================================================= */

function initializePost() {

  setupPostButtons();

  setupImport();

  setupProjectName();

  setupPostKeyboard();

  setupPostAutosave();


  const page =
    location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  if (
    page ===
    "downloads.html"
  ) {

    renderDownloadHistory();
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
    initializePost
  );

} else {

  initializePost();
}


/* =========================================================
   PUBLIC API
========================================================= */

window.LPBPost = LPBPost;

window.LPBShowToast =
  showToast;

window.LPBExportHTML =
  postExportHTML;

window.LPBExportJSON =
  postExportJSON;

window.LPBExportZip =
  postExportZip;

window.LPBImport =
  importProjectFile;

window.LPBPreview =
  postOpenPreview;

window.LPBCopyProject =
  copyProjectJSON;
