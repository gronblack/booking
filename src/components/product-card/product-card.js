$(document).ready(function () {
  $('.product-card').each(function () {
    var card = $(this);
    var list = card.find('.product-card__list');

    var controlsWrapper = card.find('.product-card__controls');
    var controls = controlsWrapper.find('.product-card__control');
    var controlFirst = controls.first();
    var controlLast = controls.last();

    // list sliding on controls click
    controls.on('click', function () {
      list.find('.product-card__item_current').removeClass('product-card__item_current');
      list.find(`[data-control=${$(this).attr('for')}]`).addClass('product-card__item_current');
    });

    // list sliding on arrows click
    card.find('.product-card__arrow-left, .product-card__arrow-right').on('click', function () {
      var currentItem = list.find('.product-card__item_current');
      var currentControl = controlsWrapper.find(`[for=${currentItem.data('control')}]`);
      if ($(this).data('way') === 'left') {
        var newControl = currentControl.prevAll('.product-card__control').first();
        if (!newControl.length) newControl = controlLast;
      } else {
        var newControl = currentControl.nextAll('.product-card__control').first();
        if (!newControl.length) newControl = controlFirst;
      }
      newControl.trigger('click');
    });
  });
});