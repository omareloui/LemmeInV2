export function getDateAfterSeconds(seconds: number, startDate = new Date()) {
  const date = startDate;
  return new Date(date.setSeconds(date.getSeconds() + seconds));
}
