// Ждём загрузки страницы
document.addEventListener("DOMContentLoaded", function () {
  // === СПИСОК ИЗОБРАЖЕНИЙ ===
  const images = [
    "images/dog.png",
    "images/cat.png",
    "images/dog2.png",
    "images/cat2.png",
    "images/dog3.png",
    "images/cat3.png",
    "images/dog4.png",
  ];

  // === ПЕРЕМЕННЫЕ ===
  let currentIndex = 0;
  let isAnimating = false;
  let autoInterval = null;
  let firstSlideDone = false;

  // === НАХОДИМ ИЗОБРАЖЕНИЕ ===
  const heroImg = document.querySelector(".hero__img");
  if (!heroImg) {
    console.error("Ошибка: изображение .hero__img не найдено");
    return;
  }

  const parent = heroImg.parentNode;

  // === СОЗДАЁМ СТРУКТУРУ СЛАЙДЕРА ===

  // 1. Создаём обёртку с фиксированным размером
  const sliderWrapper = document.createElement("div");
  sliderWrapper.className = "hero-slider";
  sliderWrapper.style.position = "relative";
  sliderWrapper.style.overflow = "hidden";
  sliderWrapper.style.width = "100%";
  sliderWrapper.style.maxWidth = "100%";
  sliderWrapper.style.maxHeight = "800px";
  sliderWrapper.style.aspectRatio = "16 / 9";
  sliderWrapper.style.background = "transparent";

  // 2. Создаём контейнер для слайдов
  const slidesContainer = document.createElement("div");
  slidesContainer.className = "hero-slides";
  slidesContainer.style.position = "absolute";
  slidesContainer.style.width = "100%";
  slidesContainer.style.height = "92%";
  slidesContainer.style.bottom = "0";

  // 3. Заменяем оригинальное изображение
  parent.replaceChild(sliderWrapper, heroImg);
  sliderWrapper.appendChild(slidesContainer);

  // 4. Создаём слайды с предзагрузкой
  const slides = [];
  let loadedImages = 0;

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.className = "hero-slide";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.transition = "transform 0.5s ease-out";
    img.style.background = "transparent";

    // Предзагрузка изображения
    const tempImg = new Image();
    tempImg.onload = function () {
      loadedImages++;
      // Когда все изображения загружены, показываем первый слайд
      if (loadedImages === images.length && index === 0) {
        img.style.opacity = "1";
      }
    };
    tempImg.src = src;

    if (index === 0) {
      img.style.transform = "translateX(0)";
      img.style.position = "relative";
      img.style.opacity = "1";
    } else {
      img.style.transform = "translateX(100%)";
      img.style.opacity = "1";
    }

    img.src = src;
    slidesContainer.appendChild(img);
    slides.push(img);
  });

  // === СОЗДАЁМ ПАГИНАЦИЮ ===
  const paginationContainer = document.querySelector(".slider-pagination");
  const dots = [];

  if (paginationContainer) {
    paginationContainer.innerHTML = "";

    images.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "slider-dot";
      if (index === currentIndex) {
        dot.classList.add("active");
      }

      dot.addEventListener("click", function () {
        if (!isAnimating && index !== currentIndex) {
          if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
          }
          switchToSlide(index);
          startAutoPlay();
        }
      });

      paginationContainer.appendChild(dot);
      dots.push(dot);
    });
  }

  // === ОБНОВЛЕНИЕ ТОЧЕК ===
  function updateDots() {
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  // === ПЕРЕКЛЮЧЕНИЕ СЛАЙДОВ С ПРАВИЛЬНОЙ АНИМАЦИЕЙ ===
  function switchToSlide(newIndex) {
    if (isAnimating) return;
    if (newIndex === currentIndex) return;

    isAnimating = true;

    const oldSlide = slides[currentIndex];
    const newSlide = slides[newIndex];

    // Принудительно устанавливаем transform перед анимацией
    oldSlide.style.transition = "transform 0.5s ease-out";
    newSlide.style.transition = "transform 0.5s ease-out";

    // Старый слайд: делаем absolute если ещё не
    oldSlide.style.position = "absolute";
    oldSlide.style.transform = "translateX(0)";

    // Новый слайд: ставим справа
    newSlide.style.position = "absolute";
    newSlide.style.transform = "translateX(100%)";

    // Форсируем перерисовку браузера
    void oldSlide.offsetHeight;
    void newSlide.offsetHeight;

    // ЗАПУСКАЕМ АНИМАЦИЮ
    // Старый уезжает влево
    oldSlide.style.transform = "translateX(-100%)";
    // Новый приезжает справа
    newSlide.style.transform = "translateX(0)";

    // Обработчик окончания анимации
    function finishAnimation() {
      // Очищаем старый слайд
      oldSlide.style.transition = "";
      oldSlide.style.position = "absolute";
      oldSlide.style.transform = "translateX(100%)";

      // Делаем новый слайд активным
      newSlide.style.transition = "";
      newSlide.style.position = "relative";
      newSlide.style.transform = "translateX(0)";

      // Обновляем индекс
      currentIndex = newIndex;
      updateDots();
      isAnimating = false;

      // Удаляем обработчики
      oldSlide.removeEventListener("transitionend", finishAnimation);
      newSlide.removeEventListener("transitionend", finishAnimation);
    }

    oldSlide.addEventListener("transitionend", finishAnimation);
    newSlide.addEventListener("transitionend", finishAnimation);

    // Таймаут безопасности
    setTimeout(function () {
      if (isAnimating) {
        finishAnimation();
      }
    }, 600);
  }

  // === АВТОПЕРЕКЛЮЧЕНИЕ ===
  function startAutoPlay() {
    if (autoInterval) clearInterval(autoInterval);

    // Запускаем первый слайд через 1 секунду (быстрее)
    autoInterval = setInterval(function () {
      if (!isAnimating) {
        let nextIndex = (currentIndex + 1) % images.length;
        switchToSlide(nextIndex);
      }
    }, 5000);
  }

  // === ПАУЗА ПРИ НАВЕДЕНИИ ===
  sliderWrapper.addEventListener("mouseenter", function () {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  });

  sliderWrapper.addEventListener("mouseleave", function () {
    if (!autoInterval) {
      startAutoPlay();
    }
  });

  // === ЗАПУСКАЕМ АВТОПЕРЕКЛЮЧЕНИЕ СРАЗУ ===
  // Небольшая задержка для первого переключения (1 секунда вместо 3)
  setTimeout(function () {
    startAutoPlay();
  }, 1000);

  console.log("Слайдер запущен");
});

// Добавляем стили для медиа-запроса
const style = document.createElement("style");
style.textContent = `
    @media (max-width: 700px) {
        .hero-slider {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-height: 500px !important;
            height: 800% !important;
        }

        .hero-slide{
        object-fit: cover !important;
        }
    }
`;
document.head.appendChild(style);
