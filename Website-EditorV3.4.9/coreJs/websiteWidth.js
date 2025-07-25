$(document).ready(function(){
    const $content = $('.main-editor-canvas');

    $('#widthSelect').on('change', function() {
        // Remove all possible classes first
        $content.removeClass('container container-fluid container-xxl');
        // Add the selected class
        const selectedClass = $(this).val();
        $content.addClass(selectedClass);

        $(this).find('img').addClass();
    });

    // Trigger change initially if you want to apply the first option by default
    $('#widthSelect').trigger('change');
});