import TimeAgo from "javascript-time-ago/modules/JavascriptTimeAgo";
import TimeAgoRu from "javascript-time-ago/locale/ru";

TimeAgo.addLocale(TimeAgoRu);
export const timeAgo = new TimeAgo('ru-RU');

export let formatNumber = digit => digit.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');

// decline word based on the number
export let decline = function (number, one, two, many) {
  let lastDigit = number % 10;
  if (number !== 11 && lastDigit === 1) return one;

  if ((number < 5 || number > 20) && lastDigit > 0 && lastDigit < 5) return two;
  else return many;
};