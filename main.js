//fxhash seed
let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var fxhash =
  "oo" +
  Array(49)
    .fill(0)
    .map((_) => alphabet[(Math.random() * alphabet.length) | 0])
    .join("");

const params = new URLSearchParams(location.search);
if (params.has("seed")) {
  const seed = params.get("seed");
  fxhash = seed;
}

let b58dec = (str) =>
  [...str].reduce((p, c) => (p * alphabet.length + alphabet.indexOf(c)) | 0, 0);
let fxhashTrunc = fxhash.slice(2);
let regex = new RegExp(".{" + ((fxhashTrunc.length / 4) | 0) + "}", "g");
let hashes = fxhashTrunc.match(regex).map((h) => b58dec(h));
let sfc32 = (a, b, c, d) => {
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
};
var fxrand = sfc32(...hashes);

//zuerst immer den NameSpace mitgeben
const ns = "http://www.w3.org/2000/svg";

const svg = document.createElementNS(ns, "svg");

//svg spezifisches Attribut viewBox um es responsive zu machen
svg.setAttribute("viewBox", "0 0 1000 1000");
document.body.append(svg);

//const um random zu definieren und dann ersetzen mit random von fxhash
// const r = Math.random;
const r = fxrand;

//zufällige Zahlen definieren
const colors = [
  ["#39FF14", "#FF00FF", "#F1C40F", "#E67E22"],
  ["#16A085", "#2980B9", "#8E44AD", "#2C3E50"],
  ["#7F8C8D", "#F39C12", "#00FF00", "#FF00FF"],
  ["#2980B9", "#5730F9", "#203", "#FF1C4C"],
];

// const colors = [
//     ["#FFFFFF", "#000000"],
//     ["#000000", "#FFFFFF"],
//   ];

const pick = (d) => d[Math.floor(r() * d.length)];

const line = (position) => {
  const p = document.createElementNS(ns, "path");

  let x = Math.floor(position[0]);
  let y = Math.floor(position[1]);
  let angle = Math.PI;
  let dist = r() * 100;

  //eine möglichkeit für random wäre 0, gibt fehler, deshlab 3 + ...
  const res = r() > 0.8 ? Math.floor(3 + r() * 50) : Math.floor(7 + r() * 10);

  const points = Array(res)
    .fill(0)
    .map((d) => {
      angle += (r() - 0.5) * 0.4;
      dist += 100;
      x += Math.sin(angle) * dist;
      y += 100;
      return [Math.floor(x), Math.floor(y)];
    });
  //Zahlen im Array zu String verbinden mit Leerschlägen und Komma, damit wir sie nacher als Linie zusammensetzen können
  const tmp = points.map((d) => d.join(" ")).join(",");


  var input = document.querySelector("input[type=text]");
  var draw = SVG().addTo("#drawing");
  var text = draw.text(function (add) {
    add.tspan(input.value);
  });

  textPath = text.path(
    `M ${points[0][0]} ${points[0][1]} C ${tmp} S ${points[2][0]} ${points[2][1]}, 180 80`
  );

  textPath.animate(1000).ease('<>')
  	.plot(`M ${points[0][1]} ${points[0][0]} C ${tmp} S ${points[2][1]} ${points[2][0]}, 80 180 `)
  	.loop(true, true)

  input.addEventListener("keyup", updateText(textPath));

  function updateText(textPath) {
    return function () {
      textPath.tspan(this.value);
    };
  }
};

//Anfangskoordinaten M
const total = Math.floor(r() * 50 + 37);
Array(total)
  .fill(0)
  .map((d) => {
    //M bedeutet moveTo, L heisst lineTo
    const x = r() * 1000;
    const y = r() * 30;

    line([x, y]);
  });

  

// –––––––––––– download and save svg

const mime = {
  type: "image/svg+xml",
};

const download = (blob) => {
  const link = document.createElement("a"),
    time = Math.round(new Date().getTime() / 1000);
  link.download = `${document.title}-${time}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
};

const save = (svg) => {
  const str = new XMLSerializer().serializeToString(svg);
  download(new Blob([str], mime));
};

const click = (e) => {
  save(svg);
};
document.addEventListener("click", click);
