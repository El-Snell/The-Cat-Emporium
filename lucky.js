const gallery = document.getElementById("lightgallery");

tags.lucky.forEach(num => {
    const a = document.createElement("a");
    a.href = `images/${num}.JPG`;

    const img = document.createElement("img");
    img.src = `images/${num}.JPG`;
    img.alt = `img${num}`;

    a.appendChild(img);
    gallery.appendChild(a);
});