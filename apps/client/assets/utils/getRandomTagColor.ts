import colors from "~~/config/tag-colors";

export default function getRandomColor() {
  const { length } = colors;
  const randomIndex = Math.floor(Math.random() * length);
  return colors[randomIndex];
}
