let isPreview = false;

$("#togglePreviewBtn").on("click", () => {
    isPreview = !isPreview;

    if (isPreview) {
        $(".toolbar").hide();
        $("#toggleStyleSidebar, #toggleSidebar").hide();
        $("#togglePreviewBtn").text("✏️ Edit");
        $("body").addClass("preview-mode");
        $('.main-editor-canvas').find('.row, .col').removeClass('p-1');
        $('.main-editor-canvas').find('.row, .col, .editor-block, .editor-canvas').addClass('no-border-preview');
        
    } else {
        initEditorAttributes();
        $(".toolbar").show();
        $("#toggleStyleSidebar, #toggleSidebar").show();
        $("#togglePreviewBtn").text("👁️ Preview");
        $("body").removeClass("preview-mode");
        $('.main-editor-canvas').removeAttr('style');
        $('.main-editor-canvas').find('.row, .col').addClass('p-1');
        $('.main-editor-canvas').find('.row, .col, .editor-block, .editor-canvas').removeClass('no-border-preview');
    }
});

$('button.resizer').each(function() {
    $(this).click(function() {
        let getSize = $(this).attr('data-size');
        $('.main-editor-canvas').width(getSize);
    });
});