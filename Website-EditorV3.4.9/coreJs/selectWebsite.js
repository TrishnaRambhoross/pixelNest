  // Load website list and first website selection
  function loadWebsiteList() {
    $.getJSON('list_websites.php', function (data) {
      const $selector = $('#websiteSelector');
      $selector.empty();

      if (data.length === 0) {
        alert("No website folders found. Please add one.");
        window.currentWebsite = '';
        return;
      }

      data.forEach(site => {
        $selector.append(`<option value="${site}">${site}</option>`);
      });

      // Select first website by default
      window.currentWebsite = data[0];
      $selector.val(window.currentWebsite);

      // Load content for the first website and default page
      loadPageContent(window.currentPage);
    }).fail(() => {
      showToast("Failed to load website list.", false);
    });
  }

  $('#websiteSelector').on('change', function () {
    const selectedWebsite = $(this).val();

    if (confirm(`Are you sure you want to switch to "${selectedWebsite}"? Unsaved changes may be lost.`)) {
      window.currentWebsite = selectedWebsite;
      loadPageContent(window.currentPage);
    } else {
      $(this).val(window.currentWebsite);
    }
  });

  loadWebsiteList();