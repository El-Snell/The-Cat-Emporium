const gallery = document.getElementById("lightgallery");

tags.bean.forEach(num => {
    const a = document.createElement("a");
    a.href = `${num}.JPG`;

    const img = document.createElement("img");
    img.src = `${num}.JPG`;
    img.alt = `img${num}`;

    a.appendChild(img);
    gallery.appendChild(a);
});