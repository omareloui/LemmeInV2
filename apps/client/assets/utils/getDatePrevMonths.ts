export default function getDatePrevMonths(monthsToSubtract: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsToSubtract);
  return date;
}
