// Swiper initialization inside document ready
function initAllSwipers() {
    $('.mySwiper').each(function (index, element) {
        if($('.mySwiper .swiper-slide').length > 1) {
            $('.mySwiper').append(`
                <!-- Optional Swiper Controls -->
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-pagination"></div>    
            `);

            const $this = $(this);

            // Add unique class suffix to avoid shared controls
            const swiperId = 'swiper-' + index;
            $this.addClass(swiperId);

            // Find or add unique controls inside this swiper container
            const nextEl = $this.find('.swiper-button-next')[0];
            const prevEl = $this.find('.swiper-button-prev')[0];
            const paginationEl = $this.find('.swiper-pagination')[0];

            new Swiper($this[0], {
                loop: false,
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: nextEl,
                    prevEl: prevEl,
                },
                pagination: {
                    el: paginationEl,
                    clickable: true,
                },
            });
        }
    });
}

// Call it on document ready
$(document).ready(function () {
    initAllSwipers();
});

function addSlide(thiss) {
    console.log('addslide !!');
    let slideCount = 1; // initialize counter

    const swiperWrapper = $(thiss).parent().parent().find('.swiper-wrapper');
    slideCount = swiperWrapper.find('.swiper-slide').length + 1;
    swiperWrapper.append(`
        <div class="swiper-slide">
            <div class="editor-block">
                <div class="row g-0">
                    <div class="col column d-flex"></div>
                </div>
            </div>
        </div>
    `);

    initAllSwipers();
}