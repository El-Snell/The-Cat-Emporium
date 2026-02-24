const sky = document.getElementById("sky");
const randomNumber = function randomNumber() {
  let r = 50;
  while (40 < r && r < 60) {
    r = Math.random() * 100
  }
  return r;
}
for (let i = 0; i < 50; i++) {
  const delay = Math.random() + "s";
  const el = document.createElement("img");
  el.src = "images/star.svg";
  el.className = "glitter-star";
  el.style.top = randomNumber() + "%";
  el.style.left = randomNumber() + "%";
  el.style.animationDelay = delay;
  sky.appendChild(el)
}