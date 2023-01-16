//fxhash seed
let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
let fxhash =
  "oo" +
  Array(49)
    .fill(0)
    .map((_) => alphabet[(Math.random() * alphabet.length) | 0])
    .join("");

// fxhash = 'oo5m2pVmYTroT4VQQV9LW7CQsoeBzwTXvpfboRSjzZMC7gwk1RT'

//mit ?seed= kann ich den seed an der URL anhängen damit
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
    let t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
};
let fxrand = sfc32(...hashes);

//––––––––––– zuerst immer den NameSpace mitgeben
const ns = "http://www.w3.org/2000/svg";

const svg = document.createElementNS(ns, "svg");

//––––––––––– svg Viewbox
svg.setAttribute("viewBox", "0 0 1000 1000");
document.body.append(svg);

var draw = SVG(svg).addTo("#drawing");

const r = fxrand;

const colors = [
  ["black", "white", "red"],
  ["white", "black", "red"],
];

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

  const str = `M ${points[0][0]} ${points[0][1]} L ${tmp}`;

  // p.setAttribute("d", str)
  // p.setAttribute("fill", "none")
  // p.setAttribute("stroke-width", "100")
  // p.setAttribute("stroke", pick(pick(colors)))
  // svg.append(p)

  function ellipse(x, y, z) {
    const g = document.createElementNS(ns, "g");
    g.setAttribute('transform',`translate(${x} ${y})`);
    g.setAttribute("fill", pick(colors))
  
    const circle = document.createElementNS(ns, "circle");
    //diese attribute müssen so heissen "cx", "cy", "r"
    circle.setAttribute("cx", 0);
    circle.setAttribute("cy", 0);
    circle.setAttribute("r", z);
    //circle.setAttribute("fill", pick(colors));
    circle.setAttribute("style",`--time: ${0.2 + r() * 30}s; --color: ${pick(pick(colors))}`)
  
    //circle.setAttribute("style",`--time: ${0.2 + Math.random() * 2}s; --color: HSL(${Math.random() * 360} 100% 50%)`)
    g.append(circle);
    svg.append(g);
  }
  
  for (let i = 0; i < 20; i++) {
    z = r() * 100;
    x = r() * (1000 - z);
    y = r() * (1000 - z);
    ellipse(x, y, z);
  }

  let input = document.querySelector("input[type=text]");
  let text = draw.text(function (add) {
    add.tspan(input.value);
  });

  let textPath = text.path(str);

  // textPath.animate(1000).ease('<>')
  // 	.plot(`M ${tmp}`)
  // 	.loop(true, true)

  input.addEventListener("keyup", updateText(textPath));

  function updateText(textPath) {
    return function () {
      textPath.tspan(this.value);
    };
  }
  text.font({ fill: "blue", family: "Helvetica", size: r()*200 });

  svg.append(textPath);
};

//Anfangskoordinaten M
// const total = Math.floor(r() * 50 + 37);
Array(10)
  .fill(0)
  .map((d) => {
    //M bedeutet moveTo, L heisst lineTo
    const x = r() * 1000;
    const y = r() * 500 - 300;

    line([x, y]);
  });

//Circles



// und mit Mouse click
// const click = (e) => {
  
// };
// document.addEventListener("click", click);






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

// mit Mouse click
// const click = (e) => {
//   save(svg);
// };
// document.addEventListener("click", click);

// mit s key
const keyHandler = (event) => {
  console.log(event.key);
  if (event.key === "1") {
    save(svg);
  }
};

document.addEventListener("keypress", keyHandler);
