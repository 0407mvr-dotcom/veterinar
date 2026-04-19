// about-slider.js - сенсорный слайдер

class AboutSlider {
    constructor(containerId = 'aboutSlider') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Container with id "${containerId}" not found`);
            return;
        }
        
        this.viewport = this.container.querySelector('.slider-viewport');
        this.track = this.container.querySelector('.slider-track');
        this.slides = Array.from(this.container.querySelectorAll('.slider-slide'));
        
        if (!this.track || this.slides.length === 0) return;
        
        this.totalSlides = this.slides.length;
        this.currentPage = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentTranslateX = 0;
        this.startTranslate = 0;
        
        // Привязываем методы
        this.dragStart = this.dragStart.bind(this);
        this.dragMove = this.dragMove.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        this.init();
    }
    
    // Получаем количество видимых слайдов
    getVisibleSlidesCount() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 4;
    }
    
    // Получаем ширину одного слайда с учетом gap
    getSlideWidth() {
        const slidesCount = this.getVisibleSlidesCount();
        const trackWidth = this.track.clientWidth;
        const gap = 20;
        return (trackWidth - (gap * (slidesCount - 1))) / slidesCount;
    }
    
    // Получаем шаг прокрутки (ширина + gap)
    getScrollStep() {
        return this.getSlideWidth() + 20;
    }
    
    // Получаем количество страниц
    getTotalPages() {
        const visibleCount = this.getVisibleSlidesCount();
        return Math.ceil(this.totalSlides / visibleCount);
    }
    
    // Получаем позицию по странице
    getPositionByPage(page) {
        const visibleCount = this.getVisibleSlidesCount();
        const scrollStep = this.getScrollStep();
        
        let scrollOffset = 0;
        for (let i = 0; i < page; i++) {
            scrollOffset += visibleCount;
        }
        
        const maxScroll = Math.max(0, this.totalSlides - visibleCount);
        const finalOffset = Math.min(scrollOffset, maxScroll);
        
        return -(finalOffset * scrollStep);
    }
    
    applyTranslate(translateValue, useTransition = true) {
        if (useTransition) {
            this.track.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        } else {
            this.track.style.transition = 'none';
        }
        this.track.style.transform = `translateX(${translateValue}px)`;
        this.currentTranslateX = translateValue;
    }
    
    goToPage(page, smooth = true) {
        const totalPages = this.getTotalPages();
        if (page < 0) page = 0;
        if (page >= totalPages) page = totalPages - 1;
        
        if (page === this.currentPage && !this.isDragging) return;
        
        this.currentPage = page;
        const newTranslate = this.getPositionByPage(this.currentPage);
        this.applyTranslate(newTranslate, smooth);
    }
    
    dragStart(e) {
        let clientX;
        
        if (e.type === 'mousedown') {
            clientX = e.clientX;
            e.preventDefault();
        } else if (e.type === 'touchstart') {
            if (e.touches.length) {
                clientX = e.touches[0].clientX;
                e.preventDefault();
            } else {
                return;
            }
        } else {
            return;
        }
        
        this.isDragging = true;
        this.startX = clientX;
        this.startTranslate = this.currentTranslateX;
        this.track.style.transition = 'none';
        
        window.addEventListener('mousemove', this.dragMove);
        window.addEventListener('mouseup', this.dragEnd);
        window.addEventListener('touchmove', this.dragMove, { passive: false });
        window.addEventListener('touchend', this.dragEnd);
        window.addEventListener('touchcancel', this.dragEnd);
    }
    
    dragMove(e) {
        if (!this.isDragging) return;
        
        let currentX;
        
        if (e.type === 'mousemove') {
            currentX = e.clientX;
        } else if (e.type === 'touchmove') {
            if (e.touches.length) {
                currentX = e.touches[0].clientX;
                const deltaX = Math.abs(currentX - this.startX);
                if (deltaX > 5) {
                    e.preventDefault();
                }
            } else {
                return;
            }
        } else {
            return;
        }
        
        const deltaX = currentX - this.startX;
        let newTranslate = this.startTranslate + deltaX;
        
        // Эффект резины на краях
        const maxLeft = 0;
        const maxRight = this.getPositionByPage(this.getTotalPages() - 1);
        
        if (newTranslate > maxLeft) {
            const overscroll = newTranslate - maxLeft;
            newTranslate = maxLeft + overscroll * 0.3;
        } else if (newTranslate < maxRight) {
            const overscroll = newTranslate - maxRight;
            newTranslate = maxRight + overscroll * 0.3;
        }
        
        this.track.style.transform = `translateX(${newTranslate}px)`;
        this.currentTranslateX = newTranslate;
    }
    
    dragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const scrollStep = this.getScrollStep();
        const movedAmount = this.startTranslate - this.currentTranslateX;
        const threshold = scrollStep * 0.2;
        
        let newPage = this.currentPage;
        
        if (movedAmount > threshold) {
            newPage = this.currentPage + 1;
        } else if (movedAmount < -threshold) {
            newPage = this.currentPage - 1;
        }
        
        const totalPages = this.getTotalPages();
        if (newPage < 0) newPage = 0;
        if (newPage >= totalPages) newPage = totalPages - 1;
        
        const targetTranslate = this.getPositionByPage(newPage);
        this.track.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        this.track.style.transform = `translateX(${targetTranslate}px)`;
        this.currentTranslateX = targetTranslate;
        this.currentPage = newPage;
        
        window.removeEventListener('mousemove', this.dragMove);
        window.removeEventListener('mouseup', this.dragEnd);
        window.removeEventListener('touchmove', this.dragMove);
        window.removeEventListener('touchend', this.dragEnd);
        window.removeEventListener('touchcancel', this.dragEnd);
    }
    
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const newTranslate = this.getPositionByPage(this.currentPage);
            this.track.style.transition = 'none';
            this.track.style.transform = `translateX(${newTranslate}px)`;
            this.currentTranslateX = newTranslate;
            setTimeout(() => {
                this.track.style.transition = '';
            }, 50);
        }, 150);
    }
    
    init() {
        if (!this.viewport || !this.track) {
            console.error('Slider elements not found');
            return;
        }
        
        const initialTranslate = this.getPositionByPage(0);
        this.applyTranslate(initialTranslate, false);
        this.currentTranslateX = initialTranslate;
        this.currentPage = 0;
        
        this.viewport.addEventListener('mousedown', this.dragStart);
        this.viewport.addEventListener('touchstart', this.dragStart, { passive: false });
        this.viewport.addEventListener('contextmenu', (e) => e.preventDefault());
        
        window.addEventListener('resize', this.handleResize);
        
        console.log('Slider ready:', {
            slides: this.totalSlides,
            visible: this.getVisibleSlidesCount(),
            pages: this.getTotalPages()
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new AboutSlider('aboutSlider');
});