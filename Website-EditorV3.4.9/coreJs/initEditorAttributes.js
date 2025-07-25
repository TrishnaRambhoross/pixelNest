function initEditorAttributes() {
  // === Config for text-based editors ===
  const editableTextSelectors = "[data-textEditable]";
  $(editableTextSelectors)
    .off("click blur")
    .on("click", function () {
      let target = this;
      if (target.nodeType === 3) target = target.parentNode;

      if (!["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes(target.tagName)) {
        target = $(target).closest("p, div, h1, h2, h3, h4, h5, h6")[0] || target;
      }

      SelectionManager.setSelected(target);
      $(target).attr("contenteditable", true).focus();
    })
    .on("blur", function () {
      setTimeout(() => {
        if (!document.activeElement || $(document.activeElement).closest("#styleSidebar").length === 0) {
          $(this).removeAttr("contenteditable");
          SelectionManager.setSelected(null);
        }
      }, 150);
    });

  // === Config for nav links ===
  $("a.nav-link[data-menuEditable]")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      SelectionManager.setSelected(this);
    });

  // === Config-driven media handlers ===
  const mediaEditors = [
    {
      selector: "img[data-editable-img]",
      boxClass: "img-edit-box",
      buildBox: (el) => `
        <div class="img-edit-box card shadow p-3">
          <div class="card-header d-flex justify-content-between align-items-center p-2">
            <h6 class="card-title mb-0">Edit Image</h6>
            <button type="button" class="btn-close btn-close-grey close-img-edit" aria-label="Close"></button>
          </div>
          <div class="card-body p-3">
            <div class="mb-3">
              <label for="imgUrlInput" class="form-label">Image URL</label>
              <input type="text" id="imgUrlInput" class="form-control img-url-input" value="${el.src}" placeholder="https://...">
            </div>
            <div class="mb-3">
              <label for="imgLinkInput" class="form-label">Link (optional)</label>
              <input type="text" id="imgLinkInput" class="form-control img-link-input" placeholder="https://...">
            </div>
            <button class="btn btn-sm btn-success img-update-btn w-100">Update</button>
          </div>
        </div>`,
      updateFn: ($box, el) => {
        const newSrc = $box.find(".img-url-input").val();
        const newLink = $box.find(".img-link-input").val();

        if (newSrc) el.src = newSrc;

        if (newLink) {
          if (!$(el).parent().is("a")) {
            $(el).wrap(`<a href="${newLink}" target="_blank"></a>`);
          } else {
            $(el).parent().attr("href", newLink);
          }
        } else {
          if ($(el).parent().is("a")) $(el).unwrap();
        }

        $box.remove();
      }
    },
    {
      selector: "video[data-editable-video]",
      boxClass: "video-edit-box",
      buildBox: (el) => `
        <div class="video-edit-box card shadow p-3">
          <div class="card-header d-flex justify-content-between align-items-center p-2">
            <h6 class="card-title mb-0">Edit Video</h6>
            <button type="button" class="btn-close btn-close-grey close-video-edit" aria-label="Close"></button>
          </div>
          <div class="card-body p-3">
            <div class="mb-3">
              <label for="videoUrlInput" class="form-label">Video URL</label>
              <input type="text" id="videoUrlInput" class="form-control video-url-input" value="${el.currentSrc}" placeholder="https://...">
            </div>
            <div class="mb-3">
              <label for="videoLinkInput" class="form-label">Link (optional)</label>
              <input type="text" id="videoLinkInput" class="form-control video-link-input" placeholder="https://...">
            </div>
            <button class="btn btn-sm btn-success video-update-btn w-100">Update</button>
          </div>
        </div>`,
      updateFn: ($box, el) => {
        const newSrc = $box.find(".video-url-input").val();
        const newLink = $box.find(".video-link-input").val();

        if (newSrc) {
          $(el).empty().append(`<source src="${newSrc}" type="video/mp4">`);
          el.load();
        }

        if (newLink) {
          if (!$(el).parent().is("a")) {
            $(el).wrap(`<a href="${newLink}" target="_blank"></a>`);
          } else {
            $(el).parent().attr("href", newLink);
          }
        } else {
          if ($(el).parent().is("a")) $(el).unwrap();
        }

        $box.remove();
      }
    }
  ];

  mediaEditors.forEach(({ selector, boxClass, buildBox, updateFn }) => {
    $(selector)
      .off("click")
      .on("click", function (e) {
        e.stopPropagation();
        if ($(`.${boxClass}`).length) return;

        SelectionManager.setSelected(this);
        const $box = $(buildBox(this));
        $(this).parent().append($box);
        $box.attr("draggable", "false");
        $box.find("button").on("click", () => updateFn($box, this));
      });
  }); 

  /**
   * Adds control elements (drag handles and delete buttons) to all elements with `data-deletable`.
   * 
   * Controls vary based on element type:
   * - For elements with classes `.block-wrapper`, `.editor-block`, or `.col`, 
   *   a controls container is appended with drag handle and delete button.
   * - For other elements, a delete button and data-sortable attribute are added directly.
   * 
   * Special cases:
   * - Elements with class `.col` inside any `<header>` or `<footer>` 
   *   (including nested) receive no controls or sortable attributes.
   * - Elements inside `<header>` or `<footer>` have drag handles disabled.
   * 
   * Uses jQuery for DOM traversal and manipulation.
   */
  function createControlElements(containerClass = "block-controls", skipSortable = false) {
    const dragHandleHTML = skipSortable
      ? ''
      : `<div class="drag-handle" data-sortable="true">☰</div>`;

    const html = `
      ${dragHandleHTML}
      <button class="delete-btn" type="button">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    return $(`<div class="${containerClass}">${html}</div>`);
  }

  $("[data-deletable]").each(function () {
    const $el = $(this);
    const isInHeaderOrFooter = $el.closest("header, footer").length > 0;
    const isCol = $el.hasClass("col");
    const isHeaderOrFooterCol = isInHeaderOrFooter && isCol;

    // Skip everything for .col inside header or footer
    if (isHeaderOrFooterCol) {
      return; // skip to next element in .each
    }

    function appendControls(containerClass) {
      if ($el.find(`.${containerClass}`).length === 0) {
        const $controls = createControlElements(containerClass, isInHeaderOrFooter);
        $el.append($controls);
      }
    }

    if ($el.hasClass("block-wrapper")) {
      appendControls("block-controls");
    } else if ($el.hasClass("editor-block")) {
      appendControls("row-block-controls");
    } else if (isCol) {
      appendControls("col-block-controls");
    } else {
      if ($el.find(".delete-btn").length === 0) {
        $el.prepend(`
          <button class="delete-btn" type="button">
            <i class="fas fa-trash-alt"></i>
          </button>`);
      }

      if (!isInHeaderOrFooter && !$el.attr("data-sortable")) {
        $el.attr("data-sortable", "true");
      }
    }
  });
}

