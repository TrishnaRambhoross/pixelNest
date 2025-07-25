$(document).ready(function() {
    $('a.nav-link').click(function(e) {
      e.preventDefault();
  
      const page = $(this).data('page') || 'home';
      const pagePath = `pages/${page}.php`;
  
      $.get(pagePath, function(data) {
        $('#page-content').html(data);
      }).fail(function() {
        $('#page-content').html('<p>Sorry, page not found.</p>');
      });
    });
});