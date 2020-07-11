$(document).ready(function () {
  $('.like-button').on('click', function () {
    const VOTED_CLASS = 'like-button_voted';
    const countElem = $(this).find('.like-button__count');
    var count = parseInt(countElem.text(), 10);

    if ($(this).hasClass(VOTED_CLASS)) {
      $(this).removeClass(VOTED_CLASS);
      countElem.text(--count);
    } else {
      $(this).addClass(VOTED_CLASS);
      countElem.text(++count);
    }
  });
});