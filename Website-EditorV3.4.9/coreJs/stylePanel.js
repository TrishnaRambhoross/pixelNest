// -- Utility functions --
function rgbToHex(rgb) {
    if (!rgb || rgb === "transparent") return "#000000";
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return "#000000";
    return "#" + match.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
}

function parsePx(value) {
    return parseInt(value) || 0;
}

// -- Style Panel Updates --
SelectionManager.onChange(el => {
    if (el) updateStylePanel(el);
    else clearStylePanel();
});

function updateStylePanel(el) {
    if (!el) return;
    const cs = getComputedStyle(el);

    $("#colorPicker").val(rgbToHex(cs.color));
    $("#bgColor").val(rgbToHex(cs.backgroundColor));
    $("#fontSize").val(parsePx(cs.fontSize));
    $("#fontWeight").val(cs.fontWeight);
    $("#textAlign").val(cs.textAlign);
    $("#textTransform").val(cs.textTransform);

    // Line height handling
    let lh = cs.lineHeight === "normal" ? 1.2 : cs.lineHeight;
    if (lh.endsWith("px")) lh = (parseFloat(lh) / parsePx(cs.fontSize)).toFixed(2);
    $("#lineHeight").val(lh);

    $("#letterSpacing").val(parseFloat(cs.letterSpacing) || 0);

    // Margins
    $("#margin-top").val(parsePx(cs.marginTop));
    $("#margin-right").val(parsePx(cs.marginRight));
    $("#margin-bottom").val(parsePx(cs.marginBottom));
    $("#margin-left").val(parsePx(cs.marginLeft));

    // Paddings
    $("#padding-top").val(parsePx(cs.paddingTop));
    $("#padding-right").val(parsePx(cs.paddingRight));
    $("#padding-bottom").val(parsePx(cs.paddingBottom));
    $("#padding-left").val(parsePx(cs.paddingLeft));

    $("#borderRadius").val(parsePx(cs.borderRadius));
    $("#borderWidth").val(parsePx(cs.borderWidth));

    // Border style and color
    $("#borderStyle").val(cs.borderStyle || "solid");
    $("#borderColor").val(rgbToHex(cs.borderColor));

    $("#fontFamily").val(cs.fontFamily);
    $("#boxShadow").val(cs.boxShadow);
    $("#animation").val(el.dataset.anim || "none");

    // Background image url extraction
    const bgImage = cs.backgroundImage;
    let bgUrl = "";
    if (bgImage && bgImage !== "none") {
        const match = bgImage.match(/url\((['"]?)(.*?)\1\)/);
        bgUrl = match ? match[2] : "";
    }
    $("#bgImage").val(bgUrl);

    $("#customCss").val(el.getAttribute("style") || "");
}

function clearStylePanel() {
    const selectors = [
        "#colorPicker", "#bgColor", "#fontSize", "#fontWeight", "#textAlign", "#textTransform",
        "#lineHeight", "#letterSpacing", "#borderRadius", "#borderWidth", "#fontFamily",
        "#boxShadow", "#animation", "#customCss", "#bgImage", "#borderStyle", "#borderColor",
        "#margin-top", "#margin-right", "#margin-bottom", "#margin-left",
        "#padding-top", "#padding-right", "#padding-bottom", "#padding-left"
    ];
    $(selectors.join(", ")).val("");
}

// -- Bind style inputs to selected element --
const bindStyle = (selector, cssProp, unit = "", attr = "val", isChange = false) => {
    const eventType = isChange ? "change" : "input";

    $(document).on(eventType, selector, function () {
        const selected = SelectionManager.getSelected();
        if (!selected) return;

        const savedRange = saveSelection();
        const value = $(this)[attr]() + unit;

        // Force inline-block display if modifying margin or padding on inline elements
        if ((cssProp === "padding" || cssProp === "margin") &&
            getComputedStyle(selected).display === "inline") {
            selected.style.display = "inline-block";
        }

        $(selected).css(cssProp, value);
        restoreSelection(savedRange);
        SelectionManager.setSelected(selected);
    });
};

// Bind all single-property style inputs
bindStyle("#colorPicker", "color");
bindStyle("#bgColor", "backgroundColor");
bindStyle("#fontFamily", "fontFamily", "", "val", true);
bindStyle("#fontSize", "fontSize", "px");
bindStyle("#fontWeight", "fontWeight", "", "val", true);
bindStyle("#textAlign", "textAlign", "", "val", true);
bindStyle("#textTransform", "textTransform", "", "val", true);
bindStyle("#lineHeight", "lineHeight");
bindStyle("#letterSpacing", "letterSpacing", "px");
bindStyle("#borderRadius", "borderRadius", "px");
bindStyle("#borderWidth", "borderWidth", "px");
bindStyle("#boxShadow", "boxShadow");
bindStyle("#bgImage", "backgroundImage");

// -- Border style and color --
$(document).on("input change", "#borderStyle, #borderColor", function () {
    const selected = SelectionManager.getSelected();
    if (!selected) return;

    const savedRange = saveSelection();

    selected.style.borderStyle = $("#borderStyle").val() || "solid";
    selected.style.borderColor = $("#borderColor").val() || "#000000";

    restoreSelection(savedRange);
    SelectionManager.setSelected(selected);
});

// -- Bind margin and padding per side --
function bindSideStyle(idPrefix, cssProp) {
    ["top", "right", "bottom", "left"].forEach(side => {
        $(document).on("input", `#${idPrefix}-${side}`, function () {
            const selected = SelectionManager.getSelected();
            if (!selected) return;

            const savedRange = saveSelection();
            let val = $(this).val();

            // Validate number input, reset if invalid
            if (val !== "" && isNaN(val)) {
                val = "";
                $(this).val("");
            }

            selected.style[cssProp + side.charAt(0).toUpperCase() + side.slice(1)] = val ? val + "px" : "";

            // Force inline-block display on inline elements for padding/margin
            if ((cssProp === "padding" || cssProp === "margin") &&
                getComputedStyle(selected).display === "inline") {
                selected.style.display = "inline-block";
            }

            restoreSelection(savedRange);
            SelectionManager.setSelected(selected);
        });
    });
}

bindSideStyle("margin", "margin");
bindSideStyle("padding", "padding");