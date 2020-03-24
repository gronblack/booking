$(document).ready(function () {
  const NOW_DATE = Date.now();

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
    dpObject.id = Math.random().toString(36).substr(2, 9);  // add my own id
    dpObject.update({
      navTitles: {
        days: 'MM yyyy'
      },
      clearButton: true,
      startDate: '',
      dateFormat: 'dd.mm.yyyy',
      keyboardNav: false,
      prevHtml: ' ',
      nextHtml: ' ',
      offset: 6,
      onShow: function (dp, animationCompleted) {
        if (!animationCompleted) {
          dp.$datepicker.width(dp.el.offsetWidth-2);          // width as input, 2px borders
          if (!window['dpCustomized'].includes(dp.id)) {      // add apply button
            var newButton = $('<span class="datepicker--button" data-action="selectDate">Применить</span>');
            dp.nav.$buttonsContainer.append(newButton);
            newButton.on('click', () => {
              if(setDatefromInput(dp.el)) dp.hide();
            });
            window['dpCustomized'].push(dp.id);
          }
        }
      }
    });
  });

  dpElements.on('input', function () {              // set date on input change
    setDatefromInput(this);
  });
});