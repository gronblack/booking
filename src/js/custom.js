$(document).ready(function () {
  const NOW_DATE = Date.now();
  const DATE_FORMATTER = new Intl.DateTimeFormat("ru");

  // dd.mm.yyyy to yyyy-mm-dd
  var correctDateString = function (dateString, separator = '.') {
    var parts = dateString.split(separator);
    if (parts.length === 3) {
      return ''+parts[2]+'-'+parts[1]+'-'+parts[0];
    }
    return false;
  };

  var isValidDate = function (dateString, dateMin = null, separator = '.') {
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

  var setDatefromInput = function(inputNode) {
    if (inputNode.value.length === 10 && isValidDate(inputNode.value)) {
      $(inputNode).data('datepicker').selectDate(new Date(correctDateString(inputNode.value)));
      return true;
    }
    return false;
  };

  // datepicker default initialization
  var dpElements = $('.datepicker-here');
  window['dpCustomized'] = [];
  dpElements.each(function () {
    var dpObject = $(this).data('datepicker');
    var dpWrapper = $(dpObject.el.closest('.date-pair'));
    dpObject.id = Math.random().toString(36).substr(2, 9);  // add my own id
    dpObject.update({
      navTitles: {
        days: 'MM yyyy'
      },
      range: !!dpWrapper.length,
      multipleDatesSeparator: ' - ',
      clearButton: true,
      startDate: '',
      dateFormat: 'dd.mm.yyyy',
      prevHtml: ' ',
      nextHtml: ' ',
      offset: 6,
      onShow: function (dp, animationCompleted) {
        if (!animationCompleted) {
          // width as input or wrapper
          var dpWrapper = $(dp.el.closest('.date-pair'));
          var elem = dpWrapper.length ? dpWrapper : $(dp.el);
          dp.$datepicker.width(elem.outerWidth());

          // add apply button
          if (!window['dpCustomized'].includes(dp.id)) {
            let newButton = $('<span class="datepicker--button" data-action="selectDate">Применить</span>');
            dp.nav.$buttonsContainer.append(newButton);
            newButton.on('click', () => {
              if(setDatefromInput(dp.el)) dp.hide();
            });
            window['dpCustomized'].push(dp.id);
          }
        }
      },
      onSelect: function (fd, date, dp) {
        // set value into pair inputs
        var dpWrapper = $(dp.el.closest('.date-pair'));
        if (dpWrapper.length) {
          let inputBlocks = dpWrapper.find('[data-dropdown-for='+dp.el.id+']');
          inputBlocks.each(function (i, el) {
            if (date[i]) $(el).find('.input-block__input').val(DATE_FORMATTER.format(date[i]));
          });
        }
      }
    });
  });

  // set date on input change
  dpElements.on('input', function () {
    setDatefromInput(this);
  });

  // show datepicker on dropdown-button click
  $('[data-dropdown-for]').on('click', function () {
    var dp = $('#'+$(this).attr("data-dropdown-for")).data('datepicker');
    if (dp !== null && !dp.visible) dp.show();
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
});