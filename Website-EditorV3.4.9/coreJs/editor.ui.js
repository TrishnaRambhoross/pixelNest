// Uses SelectionManager from editor.core.js

// Save selection range in the editable element
function saveSelection() {
    const sel = window.getSelection();
    return sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
}

// Restore selection range inside the element
function restoreSelection(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function makeReadOnly() {
    $("[data-editable]").off("click blur").removeAttr("contenteditable");
    $("img[data-editable-img]").off("click");
    $("video[data-editable-video]").off("click");
    $("a.nav-link[data-menuEditable]").off("click");
    $("[data-deletable]").each(function () {
        $(this).find(".delete-btn, .drag-handle").remove();
    });
}

$(document).on("click", ".delete-btn", function () {
    $(this).closest("[data-deletable]").remove();
    SelectionManager.setSelected(null);
    showToast("Element deleted.", true);
});

$("#animation").on("change", function () {
    const selected = SelectionManager.getSelected();
    if (!selected) return;
    const savedRange = saveSelection();

    const val = $(this).val();
    selected.dataset.anim = val;
    selected.style.animation = "none";
    selected.offsetHeight; // Trigger reflow
    selected.style.animation = getAnimationCss(val);

    restoreSelection(savedRange);
    SelectionManager.setSelected(selected);
});

$("#customCss").on("input", () => {
    const selected = SelectionManager.getSelected();
    if (!selected) return;
    const savedRange = saveSelection();

    selected.setAttribute("style", $("#customCss").val());
    restoreSelection(savedRange);
    SelectionManager.setSelected(selected);
});

function getAnimationCss(name) {
    switch (name) {
        case "fade-in": return "fadeIn 0.8s ease-out";
        case "slide-in-left": return "slideInLeft 0.5s ease-out";
        case "slide-in-right": return "slideInRight 0.5s ease-out";
        case "zoom-in": return "zoomIn 0.5s ease-out";
        default: return "none";
    }
}

function showToast(message, isSuccess = true) {
    const $toast = $("#toast");
    const $content = $("#toast-content");

    $content.removeClass("bg-success bg-danger").addClass(isSuccess ? "bg-success" : "bg-danger");
    $toast.find(".toast-body").html(message);

    $toast.fadeIn(300, () => {
        setTimeout(() => {
            $toast.fadeOut(400);
        }, 2500);
    });
}

let copiedStyle = "";

function copyStyles() {
    const selected = SelectionManager.getSelected();
    if (!selected) return;
    copiedStyle = selected.getAttribute("style") || "";
    showToast("Style copied!", true);
}

function pasteStyles() {
    const selected = SelectionManager.getSelected();
    if (!selected || !copiedStyle) return;
    selected.setAttribute("style", copiedStyle);
    updateStylePanel(selected);
    showToast("Style pasted!", true);
}

function resetStyles() {
    const selected = SelectionManager.getSelected();
    if (!selected) return;
    selected.removeAttribute("style");
    selected.style.display = "";
    delete selected.dataset.anim;
    updateStylePanel(selected);
    showToast("Style reset!", true);
}