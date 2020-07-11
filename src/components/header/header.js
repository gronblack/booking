$(document).ready(function () {
  $('.header__nav-item')
      .on('mouseenter', function () {
        $(this).find('.header__nav-submenu').addClass('header__nav-submenu_visible');
      })
      .on('mouseleave', function () {
        $(this).find('.header__nav-submenu').removeClass('header__nav-submenu_visible');
      });

  $('.header__nav-toggle').on('click', function () {
    $(this).closest('.header__nav').toggleClass('header__nav_expand');
    $('body').toggleClass('lock');
  });
});