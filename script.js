// CSS-анимация монет подключена в style.css (@keyframes coin-float)

// Плавное появление карточек секции loans и легкий параллакс фона
$(function(){
  var $cards = $('.loan-card');
  // Появление карточек
  $cards.each(function(i){
    var $card = $(this);
    setTimeout(function(){
      $card.animate({opacity: 1, top: 0}, 700, 'swing');
    }, i * 180);
  });

  // Отключаем движение фоновых изображений по требованию
  $('.loan-card__bg').each(function(){ $(this).stop(true, true).css('top', 0); });
});

// Estate: два интерфейса. Desktop — грид. ≤1200 — slick со слайдами .estate-card
$(function(){
  var $grid = $('.estate-grid');
  if (!$grid.length) return;
  var $slider = null;
  var $controls = null;

  function buildSlider(){
    if ($slider) return;
    $slider = $('<div class="estate-slider"/>');
    // Клонируем только карточки как отдельные слайды
    $grid.find('.estate-card').each(function(){
      $slider.append($(this).clone(true, true));
    });
    $grid.after($slider);
    $grid.hide();
    $slider.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      centerMode: false,
      dots: false,
      arrows: false,
      infinite: false,
      speed: 400,
      cssEase: 'ease'
    });

    // Навигация стрелками под слайдером (как в блоке отзывов)
    $controls = $('<div class="reviews-arrows">\
      <img class="reviews-arrow reviews-arrow--prev" src="images/icons/Arrow 6.svg" alt="Назад" width="65" height="24" />\
      <img class="reviews-arrow reviews-arrow--next" src="images/icons/Arrow 6.svg" alt="Вперёд" width="65" height="24" />\
    </div>');
    $slider.after($controls);
    $controls.find('.reviews-arrow--prev').on('click', function(){ $slider.slick('slickPrev'); });
    $controls.find('.reviews-arrow--next').on('click', function(){ $slider.slick('slickNext'); });
  }

  function destroySlider(){
    if ($slider){
      try { $slider.slick('unslick'); } catch(e){}
      $slider.remove();
      $slider = null;
    }
    if ($controls){ $controls.remove(); $controls = null; }
    $grid.show();
  }

  function update(){
    var isMobileUI = window.matchMedia('(max-width: 1699px)').matches;
    if (isMobileUI) buildSlider(); else destroySlider();
  }

  var t;
  $(window).on('resize', function(){ clearTimeout(t); t = setTimeout(update, 120); });
  update();
});

// Модальное меню: открытие/закрытие, плавный скролл, перенос данных из хедера для мобилки
$(function(){
  var $menu = $('#menu');
  var $panel = $menu.find('.menu-panel');
  var $openBtn = $('.burger-menu');
  if (!$menu.length || !$openBtn.length) return;

  function openMenu(){
    $menu.addClass('is-open').attr('aria-hidden','false');
    $('body').css('overflow','hidden');
    $('.burger-menu').attr('aria-expanded','true');
    // Перенос блоков из хедера в меню на мобильных
    if (window.matchMedia('(max-width: 1200px)').matches){
      var $extra = $panel.find('.menu-extra');
      $extra.empty();
      // Берём текстовые элементы хедера кроме логотипа и кнопки меню
      $('.header-text').each(function(){
        var html = $(this).html();
        $('<div/>', { class:'menu-extra__row', html: html }).appendTo($extra);
      });
    }
  }
  function closeMenu(){
    $menu.removeClass('is-open').attr('aria-hidden','true');
    $('body').css('overflow','');
    $('.burger-menu').attr('aria-expanded','false');
  }

  $openBtn.on('click', function(){
    var expanded = $(this).attr('aria-expanded') === 'true';
    if (expanded){ closeMenu(); $(this).attr('aria-expanded','false'); }
    else { openMenu(); $(this).attr('aria-expanded','true'); }
  });
  $menu.on('click', '[data-menu-close]', closeMenu);

  // Плавная прокрутка и закрытие по клику на пункт меню
  $menu.on('click', '[data-menu-link]', function(e){
    var href = $(this).attr('href');
    if (href && href.startsWith('#')){
      e.preventDefault();
      closeMenu();
      var $target = $(href);
      if ($target.length){
        $('html, body').animate({ scrollTop: $target.offset().top - 16 }, 400);
      }
    }
  });
});

// Глобальная навигация: кнопки "Оставить заявку" и "Рассчитать сумму займа"
$(function(){
  function goToCalc(e){
    e.preventDefault();
    var $target = $('#valuation-calc');
    if ($target.length){
      $('html, body').animate({ scrollTop: $target.offset().top - 16 }, 450);
    }
  }
  // Кнопки в шаге 1: открываем лид-модалку вместо скролла
  $(document).on('click', '.step-cta', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    if (window.Fancybox){
      Fancybox.show([{ src:'#lead-modal', type:'inline' }], { dragToClose:false, closeButton:false });
    } else {
      goToCalc(e);
    }
  });
  // Кнопка верхняя CTA
  $(document).on('click', '.cta-btn', function(e){
    var $btn = $(this);
    // Не перехватываем сабмиты форм и кнопки внутри модалок
    if ($btn.attr('type') === 'submit') return;
    if ($btn.closest('.modal').length > 0) return;
    var withinCalc = $btn.closest('#valuation').length > 0 || $btn.closest('#valuation-calc').length > 0;
    if (!withinCalc){ goToCalc(e); }
  });
  // approve-cta: открываем лид-модалку
  $(document).on('click', '.approve-cta', function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    if (window.Fancybox){
      Fancybox.show([{ src:'#lead-modal', type:'inline' }], { dragToClose:false, closeButton:false });
    }
  });
});

// Анимация появления карточек special при прокрутке
$(function(){
  var items = document.querySelectorAll('.special-card');
  if (!items.length) return;
  items.forEach(function(el){ el.style.opacity = 0; el.style.transform = 'translateY(12px)'; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.style.transition = 'opacity .3s ease, transform .3s ease';
        e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(function(el){ io.observe(el); });
});

// Появление блоков steps
$(function(){
  var items = document.querySelectorAll('.step');
  if (!items.length) return;
  items.forEach(function(el){ el.style.opacity = 0; el.style.transform = 'translateY(12px)'; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.style.transition = 'opacity .3s ease, transform .3s ease';
        e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function(el){ io.observe(el); });
});
// Появление карточек riski
$(function(){
  var items = document.querySelectorAll('.riski-card');
  if (!items.length) return;
  items.forEach(function(el){ el.style.opacity = 0; el.style.transform = 'translateY(12px)'; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.style.transition = 'opacity .3s ease, transform .3s ease';
        e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function(el){ io.observe(el); });
});

// Плавное появление элементов probability
$(function(){
  var items = document.querySelectorAll('.probability__left, .probability__right');
  if (!items.length) return;
  items.forEach(function(el){ el.style.opacity = 0; el.style.transform = 'translateY(12px)'; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.style.transition = 'opacity .35s ease, transform .35s ease';
        e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(function(el){ io.observe(el); });
});

// Маска телефона во всем проекте
$(function(){
  $('.wpcf7-tel').inputmask("+7 (999)-999-99-99");
});

// Калькулятор займа: обновление значений
$(function(){
  var amount = document.getElementById('loanAmount');
  var amountVal = document.getElementById('loanAmountValue');
  var term = document.getElementById('loanTerm');
  var termVal = document.getElementById('loanTermValue');
  if (amount && amountVal){
    var fmt = new Intl.NumberFormat('ru-RU');
    var updateAmount = function(){ amountVal.textContent = fmt.format(parseInt(amount.value,10)) + ' ₽'; };
    amount.addEventListener('input', updateAmount); updateAmount();
  }
  if (term && termVal){
    var updateTerm = function(){ var v = parseInt(term.value,10); termVal.textContent = v + ' ' + (v%10===1 && v%100!==11 ? 'месяц' : (v%10>=2&&v%10<=4 && (v%100<10||v%100>=20) ? 'месяца' : 'месяцев')); };
    term.addEventListener('input', updateTerm); updateTerm();
  }

  // Валидация формы калькулятора: активируем кнопку только при корректных данных
  var $valForm = $('#valuation-form');
  if ($valForm.length){
    var $submit = $valForm.find('.cta-invert');
    function validateValForm(){
      var ok = true;
      $valForm.find('input[required]').each(function(){ if (!$(this).val().trim()) ok = false; });
      // Диапазоны слайдеров уже ограничены атрибутами
      $submit.prop('disabled', !ok);
      return ok;
    }
    $valForm.on('input change', 'input', validateValForm);
    validateValForm();
    $valForm.on('submit', function(e){
      e.preventDefault();
      if (!validateValForm()) return;
      if (window.Fancybox){
        Fancybox.show([{ src:'#thanks-modal', type:'inline' }], { closeButton:false, dragToClose:false });
        setTimeout(function(){ Fancybox.close(); }, 2500);
      }
      this.reset();
      validateValForm();
      // очистка выбранных файлов и возвращение подсказки
      var out = this.querySelector('.file-selected');
      var hint = this.querySelector('.file-hint');
      var previews = this.querySelector('.file-previews');
      if (out) out.innerHTML = '';
      if (hint) hint.style.display = '';
      if (previews) previews.innerHTML = '';
    });
  }

  // probability-form: валидация и модалка спасибо
  var $prob = $('#probability-form');
  if ($prob.length){
    $prob.on('submit', function(e){
      e.preventDefault();
      var valid = true;
      $prob.find('input[required]').each(function(){ if (!$(this).val().trim()) valid = false; });
      if (!valid) return;
      if (window.Fancybox){
        Fancybox.show([{ src:'#thanks-modal', type:'inline' }], { closeButton:false, dragToClose:false });
        setTimeout(function(){ Fancybox.close(); }, 2500);
      }
      this.reset();
    });
  }
  // выбранные файлы: вывод строками без превью
  var fileInput = document.querySelector('.file-uploader input[type="file"]');
  var fileOut = document.querySelector('.file-selected');
  var fileHint = document.querySelector('.file-hint');
  var filePreviews = document.querySelector('.file-previews');
  if (fileInput){
    fileInput.addEventListener('change', function(){
      if (filePreviews) filePreviews.innerHTML = '';
      if (!this.files || this.files.length === 0){
        if (fileOut) fileOut.innerHTML = '';
        if (fileHint) fileHint.style.display = '';
        return;
      }
      var files = Array.from(this.files);
      if (fileOut) fileOut.innerHTML = files.map(function(f){ return 'Прикреплено — ' + f.name; }).join('<br>');
      if (fileHint) fileHint.style.display = 'none';
      // Превью картинок отключено по требованию
    });
  }
});

// Slick slider для отзывов
$(function(){
  if ($('.reviews-slider').length){
    var $slider = $('.reviews-slider').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,      // фиксируем ширину карточки в 550px
      centerMode: false,
      dots: false,
      arrows: false,
      infinite: true,
      speed: 400,
      cssEase: 'ease',
      adaptiveHeight: false
    });
    // Кастомные стрелки под слайдером
    // назначаем обработчики на уже вставленные SVG-стрелки
    $('.reviews-arrow--prev').on('click', function(){ $slider.slick('slickPrev'); });
    $('.reviews-arrow--next').on('click', function(){ $slider.slick('slickNext'); });
  }
});

// Fancybox для модалки «Спасибо!»
$(function(){
  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      dragToClose: false,
      closeButton: false,
    });
  }

  // Лид-форма в модалке: валидация и успех -> спасибо
  $(document).on('submit', '#lead-form', function(e){
    e.preventDefault();
    var $form = $(this);
    var name = ($form.find('input[name="name"]').val()||'').trim();
    var phone = ($form.find('input[name="phone"]').val()||'').trim();
    if (!name || !phone){
      $form.find('input').css('border-color', '#ff8080');
      return;
    }
    if (window.Fancybox){
      Fancybox.close();
      setTimeout(function(){
        Fancybox.show([{ src:'#thanks-modal', type:'inline' }], { closeButton:false, dragToClose:false });
        setTimeout(function(){ Fancybox.close(); }, 2500);
      }, 80);
    }
    $form[0].reset();
  });

  // Точки входа: Подробнее, Получить деньги, Получить консультацию
  $(document).on('click', '.loan-card__btn, .approve-cta, .consult-cta', function(e){
    var $t = $(this);
    // если это ссылочный элемент с якорем на калькулятор — перехватим в lead-модалку
    e.preventDefault();
    e.stopImmediatePropagation();
    if (window.Fancybox){
      Fancybox.show([{ src:'#lead-modal', type:'inline' }], { dragToClose:false, closeButton:false });
    }
  });
  $('#apply-form').on('submit', function(e){
    e.preventDefault();
    var form = this;

    // базовая валидация
    var valid = true;
    $(form).find('input[required], select[required]').each(function(){
      var el = $(this);
      if (!el.val()) valid = false;
      if (el.attr('type') === 'number') {
        var min = el.attr('min') ? parseFloat(el.attr('min')) : -Infinity;
        var max = el.attr('max') ? parseFloat(el.attr('max')) : Infinity;
        var val = parseFloat(el.val());
        if (isNaN(val) || val < min || val > max) valid = false;
      }
    });

    if (!valid) {
      $(form).find('.apply-hint').css('color', '#ff4d4f');
      return;
    }

    // показываем модалку спасибо
    if (window.Fancybox){
      Fancybox.show([{ src:'#thanks-modal', type:'inline' }], { closeButton:false, dragToClose:false });
      setTimeout(function(){ Fancybox.close(); }, 2500);
    }
    form.reset();
  });
});

// Пошаговый мастер формы «apply» с Inputmask и Fancybox
$(function(){
  var $apply = $('.apply');
  if ($apply.length === 0) return;

  // контейнер шага
  var $container = $('<div class="apply-wizard" />');
  var $progress = $('<div class="apply-step__progress"><span class="apply-step__num">01</span>/<span class="apply-step__total">05</span> <span class="apply-step__label">Срок займа</span></div>');
  var $fieldline = $('<div class="apply-fieldline" />');
  var $input = $('<input class="apply-big-input" type="text" autocomplete="off" />');
  var $unit = $('<span class="apply-big-unit"></span>');
  var $hint = $('<small class="apply-hint"></small>');
  var $btn = $('<button type="button" class="cta-btn apply-next" disabled><span class="apply-next-text">Далее</span><span class="cta-arrow">→</span></button>');
  $fieldline.append($input, $unit);
  $container.append($progress, $fieldline, $hint, $('<div class="apply-actions"/>').append($btn));
  $apply.find('.wrapper').append($container);

  var steps = [
    {key:'term', label:'Срок займа', unit:'мес', hint:'от 1 до 120 месяцев', mask:{ alias:'numeric', digits:0, integerDigits:3, min:1, rightAlign:false, groupSeparator:' ', autoGroup:false, showMaskOnHover:false, showMaskOnFocus:false }, inputmode:'numeric'},
    {key:'amount', label:'Желаемая сумма займа', unit:'₽', hint:'минимум 500 000', mask:{ alias:'numeric', digits:0, min:500000, rightAlign:false, groupSeparator:' ', autoGroup:true, showMaskOnHover:false, showMaskOnFocus:false }, inputmode:'numeric'},
    {key:'pledge', label:'Вид залога', unit:'', hint:'например: коммерческая недвижимость', mask:{ regex:'[A-Za-zА-Яа-яЁё\s\-]{3,60}', showMaskOnHover:false, showMaskOnFocus:false }, inputmode:'text'},
    {key:'income', label:'Заработная плата', unit:'₽', hint:'укажите чистый доход', mask:{ alias:'numeric', digits:0, min:0, rightAlign:false, groupSeparator:' ', autoGroup:true, showMaskOnHover:false, showMaskOnFocus:false }, inputmode:'numeric'},
    {key:'phone', label:'Номер телефона', unit:'', hint:'формат +7 (999)-999-99-99', mask:{ mask:'+7 (999)-999-99-99' }, inputmode:'tel'}
  ];

  var state = {}; var i = 0;

  function setMask(st){
    Inputmask.remove($input[0]);
    if (st.key === 'phone') {
      $input.inputmask(st.mask.mask);
    } else if (st.mask.alias === 'numeric') {
      Inputmask(st.mask).mask($input[0]);
    } else if (st.mask.regex) {
      Inputmask(st.mask).mask($input[0]);
    }
  }

  function render(){
    var st = steps[i];
    $apply.find('.apply-step__num').text(String(i+1).padStart(2,'0'));
    $apply.find('.apply-step__total').text(String(steps.length).padStart(2,'0'));
    $apply.find('.apply-step__label').text(st.label);
    $unit.text(st.unit || '');
    $hint.text(st.hint);
    $input.attr('inputmode', st.inputmode || 'text').val(state[st.key] || '');
    // ограничиваем длину для срока займа до 3 символов
    if (st.key === 'term') { $input.attr('maxlength', '3'); } else { $input.removeAttr('maxlength'); }
    // показываем единицы измерения (мес/₽) только если есть ввод
    if (!st.unit) { $unit.hide(); }
    else { $unit.toggle(Boolean(($input.val()||'').trim().length)); }
    setMask(st);
    toggle();
    $('.apply-next-text').text(i === steps.length-1 ? 'Отправить' : 'Далее');
  }

  function valid(){
    var st = steps[i]; var v = ($input.val()||'').trim();
    if (!v) return false;
    if (st.key === 'pledge') return /^[A-Za-zА-Яа-яЁё\s\-]{3,60}$/.test(v);
    if (st.key === 'phone') return $input.inputmask('isComplete');
    if (st.mask && st.mask.alias === 'numeric'){
      var n = parseInt(v.replace(/\s+/g,''),10);
      if (isNaN(n)) return false;
      if (st.mask.min!=null && n < st.mask.min) return false;
      if (st.mask.max!=null && n > st.mask.max) return false;
    }
    return true;
  }

  function toggle(){ $btn.prop('disabled', !valid()); }
  function autoWidth(){
    // фиксируем ширину на 100% контейнера
    $input.css('width', '100%');
  }
  $input.on('input keyup', function(){
    // Автокоррекция: если срок > 120, подставляем 120
    var st = steps[i];
    if (st && st.key === 'term'){
      var raw = ($input.val()||'').replace(/\s+/g,'');
      // Обрежем до максимум 3 символов
      if (raw.length > 3) raw = raw.slice(0,3);
      // Удалим ведущие нули, но оставим один ноль, если все нули
      raw = raw.replace(/^0+(\d)/, '$1');
      var n = parseInt(raw, 10);
      if (!isNaN(n)){
        if (n > 120) raw = '120';
        if (n < 1) raw = '1';
      }
      $input.val(raw);
    }
    // Показ/скрытие единицы измерения только при наличии значения
    if (st && st.unit){
      $unit.toggle(Boolean(($input.val()||'').trim().length));
    }
    toggle();
    autoWidth();
  });

  $btn.on('click', function(e){
    e.preventDefault();
    if (!valid()) return false;
    state[steps[i].key] = $input.val().trim();
    if (i < steps.length-1){
      i++; $container.fadeOut(120, function(){ render(); autoWidth(); $container.fadeIn(120); });
    } else {
      if (window.Fancybox){
        Fancybox.show([{ src:'#thanks-modal', type:'inline' }], { closeButton:false, dragToClose:false });
        setTimeout(function(){ Fancybox.close(); }, 2500);
      }
      i = 0; state = {}; render();
    }
    return false;
  });

  render(); autoWidth();
});

// FAQ аккордеон с активным нижним пунктом и плавным раскрытием
$(function(){
  var $faq = $('.faq');
  if (!$faq.length) return;

  // Инициализация: вычисляем высоты ответов и закрываем все, кроме .is-open
  $('.faq-item').each(function(){
    var $item = $(this);
    var $a = $item.find('.faq-a');
    if ($item.hasClass('is-open')){
      // раскрыт по умолчанию: выставляем авто-высоту
      $a.css('maxHeight', $a.prop('scrollHeight') + 'px');
    } else {
      $a.attr('hidden', true).css('maxHeight', 0);
    }
  });

  $('.faq-q').on('click', function(){
    var $btn = $(this);
    var $item = $btn.closest('.faq-item');
    var $panel = $item.find('.faq-a');
    var isOpen = $item.hasClass('is-open');

    // закрываем остальные
    $('.faq-item.is-open').not($item).each(function(){
      var $it = $(this);
      $it.removeClass('is-open').find('.faq-q').attr('aria-expanded', 'false');
      var $p = $it.find('.faq-a');
      $p.attr('hidden', true).css('maxHeight', 0);
    });

    if (isOpen){
      $item.removeClass('is-open');
      $btn.attr('aria-expanded', 'false');
      $panel.attr('hidden', true).css('maxHeight', 0);
    } else {
      $item.addClass('is-open');
      $btn.attr('aria-expanded', 'true');
      $panel.removeAttr('hidden');
      // выставляем точную высоту контента для плавности
      $panel.css('maxHeight', $panel.prop('scrollHeight') + 'px');
    }
  });
});

// Features: два интерфейса. Desktop — грид. ≤1200 — slick со слайдами .feature
$(function(){
  var $grid = $('.features-grid');
  if (!$grid.length) return;
  var $slider = null;
  var $controls = null;

  function buildFeaturesSlider(){
    if ($slider) return;
    $slider = $('<div class="features-slider"/>');
    $grid.find('.feature').each(function(){
      $slider.append($(this).clone(true, true));
    });
    $grid.after($slider);
    $grid.hide();
    $slider.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      centerMode: false,
      dots: false,
      arrows: false,
      infinite: false,
      speed: 400,
      cssEase: 'ease'
    });

    // Навигация стрелками под слайдером (как в блоке отзывов)
    $controls = $('<div class="reviews-arrows">\
      <img class="reviews-arrow reviews-arrow--prev" src="images/icons/Arrow 6.svg" alt="Назад" width="65" height="24" />\
      <img class="reviews-arrow reviews-arrow--next" src="images/icons/Arrow 6.svg" alt="Вперёд" width="65" height="24" />\
    </div>');
    $slider.after($controls);
    $controls.find('.reviews-arrow--prev').on('click', function(){ $slider.slick('slickPrev'); });
    $controls.find('.reviews-arrow--next').on('click', function(){ $slider.slick('slickNext'); });
  }

  function destroyFeaturesSlider(){
    if ($slider){
      try { $slider.slick('unslick'); } catch(e){}
      $slider.remove();
      $slider = null;
    }
    if ($controls){ $controls.remove(); $controls = null; }
    $grid.show();
  }

  function update(){
    var isSlider = window.matchMedia('(max-width: 1199px)').matches;
    if (isSlider) buildFeaturesSlider(); else destroyFeaturesSlider();
  }

  var t;
  $(window).on('resize', function(){ clearTimeout(t); t = setTimeout(update, 120); });
  update();
});
