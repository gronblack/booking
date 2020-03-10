$(document).ready(function() {
  jQuery('#date1').DatePicker({
    flat: true,
    date: ['2008-07-28','2008-07-31'],
    current: '2008-07-31',
    mode: 'range',
    starts: 1
  });

  var f = () => {
    console.log("its work");
  };
  f();
});