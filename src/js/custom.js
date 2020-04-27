$(document).ready(function () {
  const NOW_DATE = Date.now();
  const DATE_FORMATTER = new Intl.DateTimeFormat("ru");
  const SELECT_STRING_LIMIT = 27;

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
      date.forEach(function (value, i) {
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
      let inputTwo = $('#'+dp.$el.attr('data-one-for'));
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

    var pairOneId = obj.attr('data-two-for');
    var pairTwoId = obj.attr('data-one-for');
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
    dpObject.isDateRange = $(this).attr('data-is-date-range') !== undefined;
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
            let inputs = pairWrapper.length ? pairWrapper.find('.input-block__input') : $(dp.el);

            // add apply button
            let newButton = $('<span class="datepicker--button" data-action="selectDate">Применить</span>');
            dp.nav.$buttonsContainer.append(newButton);
            newButton.on('click', () => {
              if(!dp.isDateRange && setDateFromInput(dp.el)) dp.hide();
              else dp.hide();
            });

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
  $('.input-block__input[data-is-date]').on('input', function () {
    setDateFromInput(this);
  });

  // show datepicker on dropdown-button click
  $('[data-dropdown-for]').on('click', function () {
    var dp = $('#'+$(this).attr("data-dropdown-for")).data('datepicker');
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

  // change quantity in dropdown select block
  $('.input-block__select-minus, .input-block__select-plus').on('click', function () {
    var quantityElem = $(this).siblings('.input-block__select-quantity');
    var quantity = parseInt(quantityElem.text(), 10);
    if ($(this).hasClass('input-block__select-plus')) {
      quantityElem.text(++quantity);
      $(this).siblings('.input-block__select-minus').attr('disabled', quantity === 0);
    } else {
      quantityElem.text(--quantity);
      $(this).attr('disabled', quantity === 0);
    }
    recountSelectValue($(this).closest('.input-block__content').find('.input-block__input'));
  });

  // toggle select block
  $('[data-exp-button-for]').on('click', function () {
    $('#'+$(this).attr('data-exp-button-for')).toggleClass('expanded');
  });

  var recountSelectValue = function (inputNode) {
    inputNode = $(inputNode);
    if (!inputNode.length) return false;

    var selectElems = inputNode.closest('.input-block__content').find('.input-block__select-elem');
    if (selectElems.length) {
      let result = '';
      selectElems.each(function (i, elem) {
        let quantity = parseInt($(elem).find('.input-block__select-quantity').text());
        if (quantity) result += quantity+' '+$(elem).find('.input-block__select-name').text()+', ';
      });
      if (result.length) {
        result = result.slice(0, -2) + '...';
        inputNode.val(cutString(result, SELECT_STRING_LIMIT));
      }
      else inputNode.val(inputNode.attr('data-select-question'));

      return true;
    }
    return false;
  };

  var cutString = function (string, limit) {
    if (string.length <= limit) return string;
    return string.substr(0, (limit-3)) + '...';
  };
});