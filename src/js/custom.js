import * as Common from './common'

$(document).ready(function () {
  // ----------- range-slider begin -------------
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
  // ----------- range-slider end -------------



  // ----------- input begin ------------------
  const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU');

  var cutString = function (string, limit) {
    if (string.length <= limit) return string;
    return string.substr(0, (limit-3)) + '...';
  };
  var calcMaxString = function (string, resultObject, limitPX, limitLetters = 100, tempElem = null) {
    if (tempElem === null) {
      tempElem = $('<span></span>');
      tempElem.css({
        "display": "none",
        "position": "absolute",
        "left": -10000
      });
      $('body').append(tempElem);
    }
    tempElem.text(string);

    if (tempElem.width() <= limitPX) {
      tempElem.detach();
      resultObject['result'] = tempElem.text();
    } else {
      calcMaxString(cutString(tempElem.text(), string.length - 1), limitPX, resultObject, string.length - 1, tempElem);
    }
  };

  //recount list selected elements and write summary in input
  var recountSelectValue = function (inputNode) {
    inputNode = $(inputNode);
    if (!inputNode.length) return false;

    var selectElems = inputNode.closest('.input__content').find('.input__select-elem');
    if (selectElems.length) {

      var resultArray = [];

      if (inputNode.data('guestsCount') !== undefined) {  // guests counting
        var guests = 0;
        var babys = 0;
        selectElems.each(function (i, elem) {
          let sum = parseInt($(elem).find('.input__select-sum').text());
          if (sum && $(elem).data('guests') !== undefined) guests += sum;
          if (sum && $(elem).data('babys') !== undefined) babys += sum;

          $(elem).find('.input__select-minus').attr('disabled', sum === 0);
        });

        if (guests > 0) resultArray.push(guests + ' ' + Common.decline(guests, 'гость', 'гостя', 'гостей'));
        if (babys > 0) resultArray.push(babys + ' ' + Common.decline(babys, 'младенец', 'младенца', 'младенцев'));

      } else {  // general case
        selectElems.each(function (i, elem) {
          let sum = parseInt($(elem).find('.input__select-sum').text());
          if (sum) resultArray.push(sum + ' ' + $(elem).find('.input__select-name').text());

          $(elem).find('.input__select-minus').attr('disabled', sum === 0);
        });
      }

      // cut string
      if (resultArray.length) {
        var resultString = resultArray.join(', ');
        let stringLengthPX = inputNode.width();
        let dropdownButton = inputNode.siblings('.input__dropdown-button');
        if (dropdownButton.length) stringLengthPX -= dropdownButton.width();

        let calcObj = { result: '' };
        calcMaxString(resultString, calcObj, stringLengthPX, resultString.length);

        inputNode.val(calcObj.result);
      } else inputNode.val(inputNode.data('selectQuestion'));
      return true;

    }
    return false;
  };

  // dd.mm.yyyy to yyyy-mm-dd
  var correctDateString = function (dateString, separator = '.') {
    var parts = dateString.split(separator);
    if (parts.length === 3) {
      return ''+parts[2]+'-'+parts[1]+'-'+parts[0];
    }
    return false;
  };

  var isValidDate = function (dateString, dateMin = null, separator = '.') { // dateString: dd[separator]mm[separator]yyyy
    try {
      if (dateString.length !== 10) return false;
    } catch (e) {
      return false;
    }

    // First check for the pattern
    var regExp = new RegExp('^\\d{1,2}\\' + separator + '\\d{1,2}\\' + separator + '\\d{4}$');
    if (!regExp.test(dateString)) return false;

    // Parse the date parts to integers
    var parts = dateString.split(separator),
        day = parseInt(parts[0], 10),
        month = parseInt(parts[1], 10),
        year = parseInt(parts[2], 10);

    if (month == 0 || month > 12) return false; // Check the range of month

    // Check current date of min
    if (dateMin) {
      let current = new Date(year, month, day);
      if (current < dateMin)
        return false;
    } else if (year < 1900 || year > 3000)
      return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) monthLength[1] = 29; // Adjust for leap years
    if (!(day > 0 && day <= monthLength[month - 1])) return false; // Check the range of the day

    return true;
  };

  var setDateToDP = function(dp, date) {
    if (Array.isArray(date)) {
      let dateResult = [];
      date.forEach((value) => {
        if (isValidDate(value)) dateResult.push(new Date(correctDateString(value)));
        else return false;
      });
      if (dateResult.length === 1) dateResult = dateResult[0];
      window['notOnSelectDP'] = dp.id;
      dp.selectDate(dateResult);
      dp.selectDate(dateResult);    // critical!
      window['notOnSelectDP'] = null;

      let inputOne = dp.$el;
      if (inputOne.val()) inputOne.val(DATE_FORMATTER.format(dp.selectedDates[0]));
      let inputTwo = $('#'+dp.$el.data('oneFor'));
      if (inputTwo.val()) inputTwo.val(DATE_FORMATTER.format(dp.selectedDates[1]));

      return true;
    }

    if (isValidDate(date)) {
      dp.selectDate(new Date(correctDateString(date)));
      return true;
    }
    return false;
  };

  var setDateFromInput = function (input) {
    var obj = $(input);
    if (!isValidDate(obj.val())) return false;

    var pairOneId = obj.data('twoFor');
    var pairTwoId = obj.data('oneFor');
    if (pairOneId || pairTwoId) {
      if (pairOneId && !pairTwoId) pairTwoId = obj.attr('id');
      if (pairTwoId && !pairOneId) pairOneId = obj.attr('id');

      let pairOneElem = $('#'+pairOneId);
      let pairTwoElem = $('#'+pairTwoId);
      setDateToDP(pairOneElem.data('datepicker'), [pairOneElem.val(), pairTwoElem.val()]);
      return true;
    }

    return setDateToDP(obj.data('datepicker'), obj.val());
  };

  // datepicker default initialization
  var dpElements = $('.datepicker-here');
  window['dpCustomized'] = [];
  dpElements.each(function () {
    var dpObject = $(this).data('datepicker');
    dpObject.id = Math.random().toString(36).substr(2, 9);  // add my own id
    dpObject.isDatePair = !!$(this).closest('.date-pair').length;
    dpObject.isDateRange = $(this).data('isDateRange') !== undefined;
    if ($(this).hasClass('datepicker-small')) dpObject.$content.addClass('datepicker-small');
    dpObject.update({
      navTitles: {
        days: 'MM yyyy'
      },
      range: dpObject.isDatePair || dpObject.isDateRange,
      multipleDatesSeparator: ' - ',
      clearButton: true,
      startDate: '',
      dateFormat: dpObject.isDateRange ? 'd M' : 'dd.mm.yyyy',
      prevHtml: ' ',
      nextHtml: ' ',
      offset: 6,
      onShow: function (dp, animationCompleted) {
        if (!animationCompleted) {
          // width as input or wrapper
          var pairWrapper = $(dp.el.closest('.date-pair'));
          var widthElem = pairWrapper.length ? pairWrapper : $(dp.el);
          dp.$datepicker.width(widthElem.outerWidth());

          if (!window['dpCustomized'].includes(dp.id)) {
            let inputs = pairWrapper.length ? pairWrapper.find('.input__input') : $(dp.el);

            // add apply button
            let newButton = $('<button class="button button_link datepicker--button" data-action="selectDate">Применить</button>');
            dp.nav.$buttonsContainer.append(newButton);
            newButton.on('click', () => dp.hide());

            // clear second input on clear-button click
            if (dp.isDatePair) {
              let clearButton = dp.nav.$buttonsContainer.find('[data-action="clear"]');
              if (clearButton.length) {
                clearButton.on('click', () => inputs.val(''));
              }
            }

            window['dpCustomized'].push(dp.id);
          }
        }
      },
      onSelect: function (fd, date, dp) {
        // set value into pair inputs
        if (dp.id === window['notOnSelectDP']) return false;
        if (dp.isDatePair) {
          $(dp.el.closest('.date-pair')).find('[data-is-date]').each(function (i, el) {
            if (date[i]) $(this).val(DATE_FORMATTER.format(date[i]));
            else  $(this).val('');
          });
        }
      }
    });
  });

  // set date on input change
  $('.input__input[data-is-date]').on('input', function () {
    setDateFromInput(this);
  });

  // show datepicker on dropdown-button click
  $('[data-dropdown-for]').on('click', function (e) {
    e.preventDefault();
    var dp = $('#'+$(this).data('dropdownFor')).data('datepicker');
    if (dp != null && !dp.visible) dp.show();
  });

  $(document).on('mouseover', function (e) {
    // toggle pseudo-element of '.-range-from-' cell
    var dpContent = $(e.target).closest('.datepicker--content');
    if (dpContent.length) {
      if (dpContent.find('.-range-from-').length && dpContent.find('.-range-to-').length) {
        dpContent.removeClass('-range-start-');
      } else {
        dpContent.addClass('-range-start-');
      }
    }
  });

  // change sum in dropdown select block
  $('.input__select-minus, .input__select-plus').on('click', function () {
    var sumElem = $(this).siblings('.input__select-sum');
    var sum = parseInt(sumElem.text(), 10);
    if ($(this).hasClass('input__select-plus')) {
      sumElem.text(++sum);
    } else {
      sumElem.text(--sum);
    }
    recountSelectValue($(this).closest('.input__content').find('.input__input'));
  });

  // input with lists: click on clear button
  $('.input__clear-button').on('click', function () {
    var wrapper = $(this).closest('.input__content');
    wrapper.find('.input__select-sum').text(0);
    recountSelectValue(wrapper.find('.input__input'));
  });

  // recount input with lists
  $('.input_recount .input__input').each(function () {
    recountSelectValue(this);
  });

  // ----------- input end ------------------


  // ----------- like-button begin ------------------
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
  // ----------- like-button end ------------------
  
  
  // ----------- product-card begin ------------------
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
  // ----------- product-card end ------------------

  // ----------- header start ----------------------
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
  // ----------- header end ----------------------
});