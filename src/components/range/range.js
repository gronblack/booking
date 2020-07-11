import * as Common from "../../js/common";

$(document).ready(function () {
  $('.range').each(function () {
    var storage = JSON.parse(JSON.stringify($(this).data()));
    var min = storage['min'];
    var max = storage['max'];
    if (min > max) min = [max, max = min][0];         // swap

    var start = storage['start'];
    if (start < min || start > max) start = min;
    var end = storage['end'];
    if (end < min || end > max) end = max;
    if (start > end) start = [end, end = start][0];   // swap

    var bar = $(this).find('.range__bar');
    var k = bar.width() / (max - min);        // px/point

    // filled bar position
    var barFilled = bar.find('.range__bar-filled');
    barFilled.css({width: k*(end - start), left: k * (start - min)});

    // pin one position
    var pinOne = bar.find('.range__bar-pin-one');
    pinOne.css('left', k * (start - min) - pinOne.outerWidth() / 2);

    // pin two position
    var pinTwo = bar.find('.range__bar-pin-two');
    pinTwo.css('left', k * (end - min) - pinTwo.outerWidth() / 2);

    storage['min'] = min;
    storage['max'] = max;
    storage['start'] = start;
    storage['end'] = end;
    storage['k'] = k;
    storage['minPX'] = 0 - pinOne.outerWidth() / 2;
    storage['maxPX'] = bar.width() - pinOne.outerWidth() / 2;

    var factStart = $(this).find('.range__fact-start');
    var factEnd = $(this).find('.range__fact-end');
    factStart.text(Common.formatNumber(Math.round(storage['start'])));
    factEnd.text(Common.formatNumber(Math.round(storage['end'])));

    // pin mouse events
    [pinOne, pinTwo].forEach(elem =>
        elem.on('mousedown', function (e) {
          e.preventDefault();
          Object.assign(storage, {
            elemCurrent: elem,
            shift: e.clientX,
            cursorLeftLimit: -1,
            cursorRightLimit: -1,
            elemFactStart: factStart,
            elemFactEnd: factEnd,
            elemBarFilled: barFilled,
            elemPinOne: pinOne,
            elemPinTwo: pinTwo
          });

          $(document).on('mousemove', storage, rangeOnMouseMove);
          $(document).on('mouseup', rangeOnMouseUp);
        })
    );
  });

  var rangeOnMouseMove = function (e) {
    var storage = e.data;
    var cursorLeftLimit = storage['cursorLeftLimit'];
    var cursorRightLimit = storage['cursorRightLimit'];

    if (((cursorLeftLimit !== -1) && e.clientX < cursorLeftLimit)
        || ((cursorRightLimit !== -1) && e.clientX > cursorRightLimit)) {
      return false;
    }

    var shift = storage['shift'] - e.clientX;
    storage['shift'] = e.clientX;

    var newValue = parseFloat(storage['elemCurrent'].css('left')) - shift;
    var minValue = storage['minPX'];
    if (newValue < minValue) {
      newValue = minValue;
      storage['cursorLeftLimit'] = e.clientX - storage['elemCurrent'].outerWidth() / 2;
    }

    var maxValue = storage['maxPX'];
    if (newValue > maxValue) {
      newValue = maxValue;
      storage['cursorRightLimit'] = e.clientX - storage['elemCurrent'].outerWidth() / 2;
    }
    storage['elemCurrent'].css('left', newValue);

    // change fact range limits
    var digitOne = (parseFloat(storage['elemPinOne'].css('left')) + storage['elemPinOne'].outerWidth() / 2) / storage['k'] + storage['min'];
    var digitTwo = (parseFloat(storage['elemPinTwo'].css('left')) + storage['elemPinTwo'].outerWidth() / 2) / storage['k'] + storage['min'];
    storage['start'] = Math.min(digitOne, digitTwo);
    storage['end'] = Math.max(digitOne, digitTwo);
    storage['elemFactStart'].text(Common.formatNumber(Math.round(storage['start'])));
    storage['elemFactEnd'].text(Common.formatNumber(Math.round(storage['end'])));
    storage['elemBarFilled'].css({width: storage['k']*(storage['end'] - storage['start']), left: storage['k'] * (storage['start'] - storage['min'])});
  };

  var rangeOnMouseUp = function (e) {
    e.preventDefault();
    $(this).off('mousemove', rangeOnMouseMove);
    $(this).off('mouseup', rangeOnMouseUp);
  };
});