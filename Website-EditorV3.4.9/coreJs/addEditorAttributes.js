function applyEditorAttributes() {
  const $canvas = $('.main-editor-canvas');
  if ($canvas.length === 0) return;

  const config = [
    {
      // Sortable element i.e that can move
      attributes: { 'data-sortable': '' },
      selectors: [
        '.editor-block',
        'div.col',
        'div.block-wrapper',
      ].join(', '),
      excludeSelectors: [
        '.swiper .editor-block',
        'header.editor-block',
        'footer.editor-block',
        'header div.col',
        'footer div.col'
      ].join(', ')
    },
    {
      // Editable text, i.e text that can be modified
      attributes: { 'data-textEditable': '' },
      selectors: [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'label', 'span', 'a', 'button'
      ].join(', '),
      excludeSelectors: [
        '.swiper-pagination span',
        '.img-edit-box h6',
        '.img-edit-box label',
        '.img-edit-box button',
        '.swiper-ui button',
        '.nav-link',
        '.card-header',
        '.swiper .swiper-notification',
        '.swiper .swiper-pagination-bullet'
      ].join(', ')
    },
    {
      // Editable image, i.e image that can be modified
      attributes: { 'data-editable-img': '' },
      selectors: 'img',
      excludeSelectors: ''
    },
    {
      // Editable video, i.e video that can be modified
      attributes: { 'data-editable-video': '' },
      selectors: 'video',
      excludeSelectors: ''
    },
    {
      // Deletable elements, i.e elements that can be deleted
      attributes: { 'data-deletable': '' },
      selectors: [
        '.editor-block:not(.swiper .editor-block)',
        'div.col:not(.swiper-slide .col)',
        'div.block-wrapper'
      ].join(', '),
      excludeSelectors: ''
    }
  ];

  config.forEach(item => {
    let $elements = $canvas.find(item.selectors);
    if (item.excludeSelectors) {
      $elements = $elements.not(item.excludeSelectors);
    }
    // Apply each attribute individually, NOT css()
    $elements.each(function() {
      const $el = $(this);
      for (const attr in item.attributes) {
        $el.attr(attr, item.attributes[attr]);
      }
    });
  });
}