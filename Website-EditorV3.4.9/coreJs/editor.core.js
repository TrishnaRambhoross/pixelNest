// Selection manager singleton
const SelectionManager = (() => {
  let selected = null;
  const listeners = [];

  function setSelected(el) {
    selected = el;
    listeners.forEach(cb => cb(selected));
  }

  function getSelected() {
    return selected;
  }

  function onChange(cb) {
    listeners.push(cb);
  }

  return { setSelected, getSelected, onChange };
})();

// Load block HTML (returns a Promise)
function loadBlockHtml(path) {
  return $.get(path);
}

// Insert block into target container
async function insertBlock(type, target) {
  const path = resolveBlockPath(type);
  if (!path) {
    alert(`Unsupported block type: ${type}`);
    return;
  }

  try {
    const html = await loadBlockHtml(path);
    const newNode = $(html).clone();
    $(target).append(newNode);

    applyEditorAttributes();
    initEditorAttributes();
    refreshEditor();

  } catch (err) {
    alert(`Failed to load block HTML for type: ${type}`);
  }
}

// Drop block inside a column
function dropToColumn(e) {
  e.preventDefault();
  e.stopPropagation();

  const evt = e.originalEvent || e;
  const dt = evt.dataTransfer;
  if (!dt) return;

  const type = dt.getData("type");
  const fromToolbar = dt.getData("fromToolbar");
  const group = dt.getData("blockGroup");

  if (isColumnBlock(type)) {
    showToast("Columns can't be nested ❌", false);
    return;
  }

  if (fromToolbar === "true" && type) {
    insertBlock(type, e.currentTarget).then(() => {
      // ✅ Also check if this column is inside #header-canvas
      if ($("#header-canvas").has(e.currentTarget).length > 0) {
        validateMenu();
      }
    });
  } else if (group === "slider") {
    // Only allow "slider" group inside columns
    showGroupModal(group, e.currentTarget);
  } else if (group) {
    showToast(`Group "${group}" blocks can only be dropped at top level ❌`, false);
  }

  $(e.currentTarget).removeClass("drag-over");
}

// Initialize Sortable on main canvas
function initDrag() {
  new Sortable(document.getElementById("editor-canvas"), {
    animation: 150,
    ghostClass: "sortable-ghost",
    handle: "[data-sortable]",
    draggable: ".block-wrapper, .row, .editor-block",
    filter: "input, button, label, select",
    preventOnFilter: false,
  });
}

// Initialize Sortable on rows (columns)
function initColumnDrag() {
  $(".row").each(function () {
    new Sortable(this, {
      animation: 150,
      ghostClass: "sortable-ghost",
      group: "columns",
      handle: "[data-sortable]",
    });
  });
}

// Initialize Sortable on columns content
function initColumnInnerDrag() {
  $(".column").each(function () {
    new Sortable(this, {
      animation: 150,
      ghostClass: "sortable-ghost",
      group: "column-blocks",
      draggable: "#editor-canvas .editor-block, .block-wrapper, p, img, video, a, button:not(.swiper-ui button), button:not(.img-update-btn), span:not(.swiper-pagination span), h1, h2, h3, h4, h5, h6",
    });
  });
}

// Bind drop events to columns
function bindColumnDropEvents() {
  $(".column").each(function () {
    const $this = $(this);
    this.ondrop = dropToColumn;
    this.ondragover = (e) => {
      e.preventDefault();
      $this.addClass("drag-over");
    };
    this.ondragleave = () => {
      $this.removeClass("drag-over");
    };
  });
}

// Refresh editor UI
function refreshEditor() {
  initEditorAttributes();
  initColumnDrag();
  initColumnInnerDrag();
  bindColumnDropEvents();
}

// Show modal to pick block from group
function showGroupModal(groupType, dropTarget) {
  const list = BLOCK_GROUPS[groupType] || [];
  const $container = $("#block-selection-list");
  $container.empty();

  list.forEach(block => {
    const $btn = $(`
      <button class="editor btn border rounded container p-1">
        <img class="img-fluid rounded" src="templates/header/img/template_img_${block.label}.jpeg" alt="Template image">
      </button>
    `);
    $btn.on("click", async () => {
      $("#blockSelectionModal").modal("hide");
      await insertBlock(block.type, dropTarget);
    });
    $container.append($btn);
  });

  $("#blockSelectionModal").modal("show");
}

// Load content for page
function loadPageContent(page = "home", fullReload = true) {
  window.currentPage = page; // keep track of current page

  if (!window.currentWebsite || window.currentWebsite.trim() === "") {
    showToast("No website selected. Please select a website folder first.", false);
    return;
  }

  const website = window.currentWebsite;
  const isHome = page === "home";
  const baseDir = `Websites/${website}`;
  const mainPath = isHome
    ? `${baseDir}/pages/home.php`
    : `${baseDir}/pages/${page}.php`;

  const mainRequest = $.get(mainPath);

  if (fullReload) {
    const headerRequest = $.get(`${baseDir}/header.php`);
    const footerRequest = $.get(`${baseDir}/footer.php`);

    $.when(headerRequest, mainRequest, footerRequest).done((headerData, mainData, footerData) => {
      $("#header-canvas").html(headerData[0].trim() || "");
      $("#editor-canvas").html(mainData[0].trim() || "");
      $("#footer-canvas").html(footerData[0].trim() || "");

      refreshEditor();
      initDrag();
      attachLinkClickHandler();

      if (typeof window.afterEditorLoad === 'function') {
        window.afterEditorLoad();
      }
    }).fail(() => {
      showToast("Failed to load saved content. Starting with empty canvas.", false);
    });
  } else {
    mainRequest.done(mainData => {
      $("#editor-canvas").html(mainData.trim() || "");

      refreshEditor();
      initDrag();
      attachLinkClickHandler();
    }).fail(() => {
      showToast("Failed to load page content.", false);
    });
  }
}

// Intercept link clicks to load pages correctly
function attachLinkClickHandler() {
  $('#header-canvas, #footer-canvas, #editor-canvas')
    .off('click', 'a')
    .on('click', 'a', (e) => {
      e.preventDefault();
      const href = $(e.currentTarget).attr('href');
      if (href && href.endsWith('.php')) {
        const parts = href.split('/');
        const filename = parts[parts.length - 1];
        const page = filename.replace('.php', '');
        loadPageContent(page, false);
      } else {
        showToast("Unsupported link or format", false);
      }
    });
}

// Initialize everything on document ready
$(document).ready(() => {
  // Drag from toolbar
  $(".block").off("dragstart").on("dragstart", (e) => {
    const dt = e.originalEvent.dataTransfer;
    dt.setData("type", $(e.currentTarget).data("type"));
    dt.setData("fromToolbar", "true");
  });

  // Drag from group headers
  $("[data-group-type]").off("dragstart").on("dragstart", (e) => {
    const dt = e.originalEvent.dataTransfer;
    dt.setData("blockGroup", $(e.currentTarget).data("group-type"));
    dt.setData("type", "");
    dt.setData("fromToolbar", "false");
  });

  // Canvas accepts columns or group headers only
  $("#editor-canvas, #header-canvas, #footer-canvas")
    .off("dragover drop")
    .on("dragover", e => {
      e.preventDefault();
    })
    .on("drop", async (e) => {
      e.preventDefault();

      const dt = e.originalEvent.dataTransfer;
      const type = dt.getData("type");
      const fromToolbar = dt.getData("fromToolbar");
      const group = dt.getData("blockGroup");

      // Allow dropping a column block directly
      if (fromToolbar === "true" && isColumnBlock(type)) {
        await insertBlock(type, e.currentTarget);

        // ✅ Run updateHeaderMenuDOM only if dropped in header
        if (e.currentTarget.id === "header-canvas") {
          updateHeaderMenuDOM();
        }
      }

      // If slider is dropped at top level, insert a column first and then insert the slider inside it
      else if (group === "slider") {
        try {
          const columnWrapper = $(`
            <div class="editor-block">
              <div class="row mb-2 p-1 column-gap-0 g-0">
                <div class="col p-1 column"></div>
              </div>
            </div>
          `);
          $(e.currentTarget).append(columnWrapper);

          applyEditorAttributes();
          refreshEditor();

          const newColumn = columnWrapper.find(".column").get(0);
          showGroupModal("slider", newColumn);
        } catch {
          showToast("Failed to insert column before slider block ❌", false);
        }
      }
      // Allow other group blocks
      else if (group) {
        showGroupModal(group, e.currentTarget);
      }
      // Otherwise show error
      else {
        showToast("Only column layouts are allowed at top level ❌", false);
      }
    });

  // Mutation observer for editor canvas updates
  const observer = new MutationObserver(mutationsList => {
    if (mutationsList.some(m => m.type === 'childList' && m.addedNodes.length > 0)) {
      applyEditorAttributes();
      refreshEditor();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Allow inputs to be used without breaking selection
  $("#styleSidebar").on("mousedown", "input, select, textarea", e => {
    e.stopPropagation();
  });
});