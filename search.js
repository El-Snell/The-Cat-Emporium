const bean = document.getElementById("beancheck");
const bert = document.getElementById("bertcheck");
const lucky = document.getElementById("luckycheck");
const soji = document.getElementById("sojicheck");
const lightgallery = document.getElementById("lightgallery");

// Reload page
function reload_page() {
  location.reload;
}
bean.addEventListener("change", () => {
  reload_images();
});
bert.addEventListener("change", () => {
  reload_images();
});
lucky.addEventListener("change", () => {
  reload_images();
});
soji.addEventListener("change", () => {
  reload_images();
});
function reload_images() {
  lightgallery.replaceChildren();
  let num_checked;
  const checked = [];
  if (bean.checked == true) {
    num_checked ++;
    checked.push(bean);
  }
  if (bert.checked == true) {
    num_checked ++;
    checked.push(bert);
  }
  if (lucky.checked == true) {
    num_checked ++;
    checked.push(lucky);
  }
  if (soji.checked == true) {
    num_checked ++;
    checked.push(soji);
  }
  const nums = [];
  if (num_checked > 0) {
    tags.checked[0].array.forEach(num => {
    if (num_checked > 1) {
      tags.checked[1].forEach(num1 =>{
        if (num_checked > 2) {
          tags.checked[2].forEach(num2 => {
            if (num_checked > 3) {
              tags.checked[3].forEach(num3 => {
                if (num == num1 == num2 == num3) {
                  nums.push(num3);
                }

              });
            } else {
              if (num == num1 == num2) {
                nums.push(num2);
              }
            }
          });
        } else {
          if (num == num1) {
            nums.push(num1);
          }
        }

      });
    } else {
      nums.push(num);
    }
    });
    nums.forEach(num => {
      const a = document.createElement("a");
      a.href = `images/${num}.JPG`;

      const img = document.createElement("img");
      img.src = `images/${num}.JPG`;
      img.alt = `img${num}`;

      a.appendChild(img);
      lightgallery.appendChild(a);
    });
  }
}
