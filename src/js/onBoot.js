import * as Common from './common'

$(document).ready(function () {
  $('[datetime]').each(function () {
    $(this).text(Common.timeAgo.format(new Date($(this).attr('datetime'))));
  });

  $('[data-format-number]').each(function () {
    let elem = $(this);
    let digits = elem.text().replace(/[^\d]/g, '');
    let letter = elem.text().replace(/[\d]/g, '');
    elem.text(Common.formatNumber(digits) + letter);
  });

  // select block toggle
  $('[data-expand-for]').on('click', function (e) {
    e.preventDefault();
    $('#'+$(this).data('expandFor')).toggleClass('expanded');
  });

  $('[data-decline-nubmer]').each(function () {
    let node = $(this);
    node.text(
        $.parseHTML(
            `${node.data('declineNubmer')}&nbsp;${Common.decline(node.data('declineNubmer'), node.data('declineOne'), node.data('declineTwo'), node.data('declineMany'))}`
        )[0].data
    );
  });
});