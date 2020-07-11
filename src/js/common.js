/************* EXPORTS *******************/
// decline word based on the number
export const decline = function (number, one, two, many) {
  let lastDigit = number % 10;
  if (number !== 11 && lastDigit === 1) return one;

  if ((number < 5 || number > 20) && lastDigit > 0 && lastDigit < 5) return two;
  else return many;
};
export const formatNumber = digit => digit.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');


/************* ON BOOT *******************/
import TimeAgo from "javascript-time-ago/modules/JavascriptTimeAgo";
import TimeAgoRu from "javascript-time-ago/locale/ru";
TimeAgo.addLocale(TimeAgoRu);
const timeAgo = new TimeAgo('ru-RU');

$(document).ready(function () {
  $('[datetime]').each(function () {
    $(this).text(timeAgo.format(new Date($(this).attr('datetime'))));
  });

  $('[data-format-number]').each(function () {
    let elem = $(this);
    let digits = elem.text().replace(/[^\d]/g, '');
    let letter = elem.text().replace(/[\d]/g, '');
    elem.text(formatNumber(digits) + letter);
  });

  // select block toggle
  $('[data-expand-for]').on('click', function (e) {
    e.preventDefault();
    $('#'+$(this).data('expandFor')).toggleClass('expanded');
  });

  $('[data-decline-number]').each(function () {
    let node = $(this);
    node.text(
        $.parseHTML(
            `${node.data('declineNumber')}&nbsp;${decline(node.data('declineNumber'), node.data('declineOne'), node.data('declineTwo'), node.data('declineMany'))}`
        )[0].data
    );
  });
});