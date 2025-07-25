$(document).ready(function () {
  // ======= GLOBALS =======
  let multiPageMenuItems = [];
  let onePageMenuItems = [];

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // ======= MULTI-PAGE =======
  function renderMultiPageMenuLists() {
    const $activeList = $("#menuListActive");
    const $disabledList = $("#menuListDisabled");

    $activeList.empty();
    $disabledList.empty();

    multiPageMenuItems.forEach((item, index) => {
      if (item.disabled) {
        $disabledList.append(`
          <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span class="me-auto">${item.name}</span>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-sm btn-success reactivate-btn" data-index="${index}">Reactivate</button>
                <button class="btn btn-sm btn-danger delete-btn-menu" data-index="${index}">Delete</button>
              </div>
            </div>
          </li>
        `);
      } else {
        $activeList.append(`
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <input type="text" class="form-control form-control-sm me-3 menu-edit-input"
              data-index="${index}" value="${item.name}" />
            <button class="btn btn-sm btn-warning disable-btn" data-index="${index}">Disable</button>
          </li>
        `);
      }
    });
  }

  function updateHeaderMultiPageMenuDOM() {
    const $ul = $("header.editor-block nav ul.nav");
    if ($ul.length === 0) return;

    $ul.empty();
    multiPageMenuItems.forEach(item => {
      if (!item.disabled) {
        const slug = slugify(item.name);
        $ul.append(`
          <li class="nav-item">
            <a class="nav-link" href="${slug}.php">${item.name}</a>
          </li>
        `);
      }
    });
  }

  $("#addMenuBtn").on("click", function () {
    const newItem = $("#newMenuItem").val().trim();
    if (newItem && !multiPageMenuItems.some(i => i.name === newItem && !i.disabled)) {
      multiPageMenuItems.push({ name: newItem, oldSlug: slugify(newItem), disabled: false });
      $("#newMenuItem").val("");
      renderMultiPageMenuLists();
      updateHeaderMultiPageMenuDOM();
    }
  });

  $("#menuListActive").on("click", ".disable-btn", function () {
    const index = $(this).data("index");
    multiPageMenuItems[index].disabled = true;
    renderMultiPageMenuLists();
    updateHeaderMultiPageMenuDOM();
  });

  $("#menuListDisabled").on("click", ".reactivate-btn", function () {
    const index = $(this).data("index");
    if (multiPageMenuItems.some((item, i) => i !== index && !item.disabled && item.name === multiPageMenuItems[index].name)) {
      alert("An active menu with the same name already exists.");
      return;
    }
    multiPageMenuItems[index].disabled = false;
    renderMultiPageMenuLists();
    updateHeaderMultiPageMenuDOM();
  });

  $("#menuListDisabled").on("click", ".delete-btn-menu", function () {
    const index = $(this).data("index");
    const item = multiPageMenuItems[index];
    if (confirm(`⚠️ Delete page "${item.name}"?`)) {
      const website = window.currentWebsite || "default";
      const slug = slugify(item.name);
      $.ajax({
        url: "delete_menu_file.php",
        type: "POST",
        data: { slug, website, mode: "multi" },
        dataType: "json",
        success: function (res) {
          if (res.status === "success") {
            multiPageMenuItems.splice(index, 1);
            renderMultiPageMenuLists();
            updateHeaderMultiPageMenuDOM();
          } else {
            alert("⚠️ " + res.message);
          }
        }
      });
    }
  });

  $("#menuListActive").on("input", ".menu-edit-input", function () {
    const index = $(this).data("index");
    const newName = $(this).val().trim();
    if (!newName) return;
    if (multiPageMenuItems.some((item, i) => i !== index && !item.disabled && item.name === newName)) return;
    multiPageMenuItems[index].name = newName;
    renderMultiPageMenuLists();
    updateHeaderMultiPageMenuDOM();
  });

  $("#validateMenuBtn").on("click", function () {
    const website = window.currentWebsite || "default";
    const renameData = multiPageMenuItems
      .filter(item => !item.disabled)
      .map(item => ({ oldSlug: item.oldSlug, newName: item.name }));

    $.ajax({
      url: "validate_menu.php",
      type: "POST",
      data: { renameData: JSON.stringify(renameData), website, mode: "multi" },
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          alert("✅ Multi-page Menu validated!");
          multiPageMenuItems.forEach(item => item.oldSlug = slugify(item.name));
          updateHeaderMultiPageMenuDOM();
        } else {
          alert("⚠️ " + response.message);
        }
      }
    });
  });

  // ======= ONE PAGE =======

  function saveOnePageMenuToLocal() {
    localStorage.setItem('onePageMenuItems', JSON.stringify(onePageMenuItems));
  }

  function loadOnePageMenuFromHeaderOrLocal() {
    const data = localStorage.getItem('onePageMenuItems');
    if (data) {
      try {
        onePageMenuItems = JSON.parse(data);
      } catch {
        onePageMenuItems = [];
      }
    }

    if (!onePageMenuItems || onePageMenuItems.length === 0) {
      // No saved localStorage, load from header nav
      const $navLinks = $("header.editor-block nav ul.nav li.nav-item a.nav-link");
      onePageMenuItems = [];
      $navLinks.each(function () {
        const name = $(this).text().trim();
        let href = $(this).attr("href") || "";
        // extract anchor id from href, assuming format "#id"
        const id = href.startsWith("#") ? href.slice(1) : "";
        if (name && id) {
          onePageMenuItems.push({ name, id, disabled: false });
        }
      });
      // Save to localStorage for future
      saveOnePageMenuToLocal();
    }
  }

  function renderOnePageMenuLists() {
    const $activeList = $("#onePageMenuListActive");
    const $disabledList = $("#onePageMenuListDisabled");

    $activeList.empty();
    $disabledList.empty();

    onePageMenuItems.forEach((item, index) => {
      if (item.disabled) {
        $disabledList.append(`
          <li class="list-group-item">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span class="me-auto">${item.name} (#${item.id})</span>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-sm btn-success reactivate-btn" data-index="${index}">Reactivate</button>
                <button class="btn btn-sm btn-danger delete-btn-menu" data-index="${index}">Delete</button>
              </div>
            </div>
          </li>
        `);
      } else {
        $activeList.append(`
          <li class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div class="flex-fill w-100 d-flex">
              <label class="mb-1">Menu</label>
              <input type="text" class="form-control form-control-sm mb-1 onepage-menu-name-input"
                data-index="${index}" value="${item.name}" placeholder="Menu Label" />
              <label class="mb-1">ID</label>
              <input type="text" class="form-control form-control-sm onepage-menu-id-input"
                data-index="${index}" value="${item.id}" placeholder="Anchor ID" />
            </div>
            <button class="btn btn-sm btn-warning disable-btn" data-index="${index}">Disable</button>
          </li>
        `);
      }
    });
  }

  function updateHeaderOnePageMenuDOM() {
    const $ul = $("header.editor-block nav ul.nav");
    if ($ul.length === 0) return;
    $ul.empty();
    onePageMenuItems.forEach(item => {
      if (!item.disabled) {
        $ul.append(`
          <li class="nav-item">
            <a class="nav-link" href="#${item.id}">${item.name}</a>
          </li>
        `);
      }
    });
  }

  $("#addOnePageMenuBtn").on("click", function () {
    const name = $("#newOnePageMenuItem").val().trim();
    const id = $("#newOnePageMenuID").val().trim().replace(/[^a-zA-Z0-9\-_]/g, "");
    if (name && id && !onePageMenuItems.some(i => i.name === name && !i.disabled)) {
      onePageMenuItems.push({ name, id, disabled: false });
      $("#newOnePageMenuItem").val("");
      $("#newOnePageMenuID").val("");
      renderOnePageMenuLists();
      updateHeaderOnePageMenuDOM();
      saveOnePageMenuToLocal();
    }
  });

  $("#onePageMenuListActive").on("click", ".disable-btn", function () {
    const index = $(this).data("index");
    onePageMenuItems[index].disabled = true;
    renderOnePageMenuLists();
    updateHeaderOnePageMenuDOM();
    saveOnePageMenuToLocal();
  });

  $("#onePageMenuListDisabled").on("click", ".reactivate-btn", function () {
    const index = $(this).data("index");
    if (onePageMenuItems.some((item, i) => i !== index && !item.disabled && item.name === onePageMenuItems[index].name)) {
      alert("An active menu with the same name already exists.");
      return;
    }
    onePageMenuItems[index].disabled = false;
    renderOnePageMenuLists();
    updateHeaderOnePageMenuDOM();
    saveOnePageMenuToLocal();
  });

  $("#onePageMenuListDisabled").on("click", ".delete-btn-menu", function () {
    const index = $(this).data("index");
    onePageMenuItems.splice(index, 1);
    renderOnePageMenuLists();
    updateHeaderOnePageMenuDOM();
    saveOnePageMenuToLocal();
  });

  $("#onePageMenuListActive").on("input", ".onepage-menu-name-input", function () {
    const index = $(this).data("index");
    onePageMenuItems[index].name = $(this).val().trim();
    renderOnePageMenuLists();
    updateHeaderOnePageMenuDOM();
    saveOnePageMenuToLocal();
  });

  $("#onePageMenuListActive").on("input", ".onepage-menu-id-input", function () {
    const index = $(this).data("index");
    onePageMenuItems[index].id = $(this).val().trim().replace(/[^a-zA-Z0-9\-_]/g, "");
    renderOnePageMenuLists();
    updateHeaderOnePageMenuDOM();
    saveOnePageMenuToLocal();
  });

  $("#validateOnePageMenuBtn").on("click", function () {
    const website = window.currentWebsite || "default";
    const renameData = onePageMenuItems
      .filter(item => !item.disabled)
      .map(item => ({ name: item.name, id: item.id }));

    $.ajax({
      url: "validate_menu.php",
      type: "POST",
      data: { renameData: JSON.stringify(renameData), website, mode: "onepage" },
      dataType: "json",
      success: function (response) {
        if (response.status === "success") {
          alert("✅ One Page Menu validated!");
          updateHeaderOnePageMenuDOM();
        } else {
          alert("⚠️ " + response.message);
        }
      }
    });
  });

  // When modal opens, load both sets
  $("#menuManagerModal").on("show.bs.modal", function () {
    // Multi-page: load pages
    const website = window.currentWebsite || "default";
    $.ajax({
      url: "get_all_menu_pages.php",
      type: "GET",
      data: { website },
      dataType: "json",
      success: function (response) {
        if (response.status !== "success") return;
        const allPages = response.pages;
        const $nav = $("header.editor-block nav ul.nav").parent("nav");
        const activeMenus = [];
        $nav.find("ul.nav li.nav-item a.nav-link").each(function () {
          const label = $(this).text().trim();
          const slug = slugify(label);
          if (label) activeMenus.push({ name: label, oldSlug: slug, disabled: false });
        });
        const activeSlugs = activeMenus.map(m => m.oldSlug);
        const disabledMenus = allPages.filter(pageSlug => !activeSlugs.includes(pageSlug))
          .map(pageSlug => ({ name: pageSlug.replace(/-/g, " "), oldSlug: pageSlug, disabled: true }));
        multiPageMenuItems = [...activeMenus, ...disabledMenus];
        renderMultiPageMenuLists();
      }
    });

    // Load one-page menu from localStorage or fallback to header nav
    loadOnePageMenuFromHeaderOrLocal();
    renderOnePageMenuLists();
  });
});
