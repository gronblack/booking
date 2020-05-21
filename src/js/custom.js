import TimeAgo from "javascript-time-ago/modules/JavascriptTimeAgo";
import TimeAgoRu from "javascript-time-ago/locale/ru";

$(document).ready(function () {
  const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU');
  const SELECT_STRING_LIMIT = 27;

  // ----------- common begin ----------------------------
  TimeAgo.addLocale(TimeAgoRu);
  const timeAgo = new TimeAgo('ru-RU');
  $('[datetime]').each(function () {
    $(this).text(timeAgo.format(new Date($(this).attr('datetime'))));
  });

  var formatDigit = digit => digit.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');

  // select block toggle
  $('[data-expand-for]').on('click', function () {
    $('#'+$(this).data('expandFor')).toggleClass('expanded');
  });
  // ----------- common end ----------------------------


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
    factStart.text(formatDigit(Math.round(storage['start'])));
    factEnd.text(formatDigit(Math.round(storage['end'])));

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
    storage['elemFactStart'].text(formatDigit(Math.round(storage['start'])));
    storage['elemFactEnd'].text(formatDigit(Math.round(storage['end'])));
    storage['elemBarFilled'].css({width: storage['k']*(storage['end'] - storage['start']), left: storage['k'] * (storage['start'] - storage['min'])});
  };

  var rangeOnMouseUp = function (e) {
    e.preventDefault();
    $(this).off('mousemove', rangeOnMouseMove);
    $(this).off('mouseup', rangeOnMouseUp);
  };
  // ----------- range-slider end -------------



  // ----------- input begin ------------------
  var cutString = function (string, limit) {
    if (string.length <= limit) return string;
    return string.substr(0, (limit-3)) + '...';
  };
  var decline = function (number) {//debugger
    var lastDigit = number % 10;
    if (number !== 11 && lastDigit === 1) return 'гость';

    if ((number < 5 || number > 20) && lastDigit > 0 && lastDigit < 5) return 'гостя';
    else return 'гостей';
  };

  //recount list selected elements and write summary in input
  var recountSelectValue = function (inputNode) {
    inputNode = $(inputNode);
    if (!inputNode.length) return false;

    var selectElems = inputNode.closest('.input__content').find('.input__select-elem');
    if (selectElems.length) {

      if (inputNode.data('selectCaption') !== undefined) {
        var result = 0;
        selectElems.each(function (i, elem) {
          let sum = parseInt($(elem).find('.input__select-sum').text());
          if (sum) result += sum;

          $(elem).find('.input__select-minus').attr('disabled', sum === 0);
        });

        //debugger
        if (result > 0) {
          inputNode.val(result + ' ' + decline(result));
        } else inputNode.val(inputNode.data('selectQuestion'));
        return true;
      }

      var result = '';
      selectElems.each(function (i, elem) {
        let sum = parseInt($(elem).find('.input__select-sum').text());
        if (sum) result += sum + ' '+$(elem).find('.input__select-name').text()+', ';

        $(elem).find('.input__select-minus').attr('disabled', sum === 0);
      });
      if (result.length) {
        result = result.slice(0, -2) + '...';
        inputNode.val(cutString(result, SELECT_STRING_LIMIT));
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
  $('[data-dropdown-for]').on('click', function () {
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
  $('.input.recount .input__input').each(function () {
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

});