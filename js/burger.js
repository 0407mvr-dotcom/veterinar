 (function() {
        // Элементы
        const burgerBtn = document.querySelector('.burger-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.menu-overlay');
        const body = document.body;

        // Все ссылки внутри мобильного меню (для закрытия после клика)
        const mobileLinks = document.querySelectorAll('.mobile-menu a');

        // Функция закрытия меню
        function closeMenu() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            burgerBtn.classList.remove('active');
            burgerBtn.setAttribute('aria-expanded', 'false');
            // Разблокируем прокрутку body (если она была заблокирована)
            body.style.overflow = '';
        }

        // Функция открытия меню
        function openMenu() {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            burgerBtn.classList.add('active');
            burgerBtn.setAttribute('aria-expanded', 'true');
            // Блокируем прокрутку фона, чтобы меню было комфортнее
            body.style.overflow = 'hidden';
        }

        // Обработчик клика по бургеру
        if (burgerBtn) {
            burgerBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (mobileMenu.classList.contains('active')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }

        // Закрытие меню при клике на оверлей (затемнение)
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }

        // Закрытие меню при клике на любую ссылку в мобильном меню (удобство навигации)
        mobileLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Если ссылка ведёт на якорь или другую страницу, меню закрывается
                closeMenu();
                // Даем возможность браузеру обработать переход (не блокируем)
            });
        });

        // Дополнительно: закрытие при изменении размера окна (если окно стало > 700px и меню открыто)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 700 && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
            // Синхронизация: если ширина больше 700, то бургер может быть неактивен, но если меню открыто — закрываем
            if (window.innerWidth > 700 && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Базовая проверка: при загрузке, если ширина окна <=700 и меню почему-то активно — закрываем для чистоты
        if (window.innerWidth <= 700 && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    })();