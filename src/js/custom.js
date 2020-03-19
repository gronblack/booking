$(document).ready(function() {
  $('#date1').datepicker({
    minDate: new Date()
  });

  var f = () => {
    console.log("its work");
  };
  f();
});