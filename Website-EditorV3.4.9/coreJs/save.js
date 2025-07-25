// Cleans the editor UI artifacts and data attributes before saving
function cleanEditorHtml($container) {
  // Clone the container to avoid modifying live DOM
  const $clone = $container.clone();

  // Remove editor-specific controls and UI elements
  $clone.find('.drag-handle, .delete-btn, .block-controls, .row-block-controls, .col-block-controls, .img-edit-box, .video-edit-box').remove();

  // Remove all data-* attributes used for editor
  $clone.find('*').each(function () {
    $.each(this.attributes, function () {
      if (this.name.startsWith('data-') && this.name !== 'data-page') {
        $(this.ownerElement).removeAttr(this.name);
      }
    });
  });

  return $clone.html();
}

function saveSite() {
  const header = cleanEditorHtml($("#header-canvas"));
  const main = cleanEditorHtml($("#editor-canvas"));
  const footer = cleanEditorHtml($("#footer-canvas"));

  // Use currentPage global variable to save correct page, default to 'home'
  const page = window.currentPage || "home"; 
  const website = window.currentWebsite || "default";

  const menuItems = window.getMenuItems ? window.getMenuItems() : [];

  $.post("save.php", { header, main, footer, page, website, menu: JSON.stringify(menuItems) }, function (response) {
    if (response.status === "success") {
      showToast(response.message, true);
    } else {
      showToast("Error saving: " + response.message, false);
    }
  }, "json").fail(function () {
    showToast("Network error during save ❌", false);
  });
}
