const WIDTH = 120;
const HEIGHT = 40;
const ASCII = " .:-=+*#%@";
const DIST = 5;
const SCALE = 20;

const screen = document.getElementById("screen");

let vertices = [];
let angle = 0;

async function loadOBJ(url) {
  const res = await fetch(url);
  const text = await res.text();
  const verts = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("v ")) {
      const [, x, y, z] = line.trim().split(/\s+/);
      verts.push({
        x: parseFloat(x),
        y: parseFloat(y),
        z: parseFloat(z)
      });
    }
  }
  return verts;
}

function rotateY(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a);
  return {
    x: v.x * cos + v.z * sin,
    y: v.y,
    z: -v.x * sin + v.z * cos
  };
}

function rotateX(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a);
  return {
    x: v.x,
    y: v.y * cos - v.z * sin,
    z: v.y * sin + v.z * cos
  };
}

function project(v) {
  const z = v.z + DIST;
  const px = v.x * SCALE / z;
  const py = v.y * SCALE / z;
  const sx = Math.floor(WIDTH / 2 + px);
  const sy = Math.floor(HEIGHT / 2 - py);
  return { sx, sy, z };
}

function render() {
  const buffer = new Array(WIDTH * HEIGHT).fill(" ");
  const zbuf = new Array(WIDTH * HEIGHT).fill(-Infinity);

  const ax = Math.sin(angle) * 0.5;
  const ay = angle;

  for (const v of vertices) {
    let r = rotateY(v, ay);
    r = rotateX(r, ax);

    const { sx, sy, z } = project(r);
    if (sx < 0 || sx >= WIDTH || sy < 0 || sy >= HEIGHT) continue;

    const idx = sy * WIDTH + sx;
    if (z > zbuf[idx]) {
      zbuf[idx] = z;
      // fake brightness based on y (top/bottom shading)
      const b = (r.y + 1) / 2;
      const ci = Math.max(0, Math.min(ASCII.length - 1, Math.floor(b * ASCII.length)));
      buffer[idx] = ASCII[ci];
    }
  }

  let out = "";
  for (let y = 0; y < HEIGHT; y++) {
    out += buffer.slice(y * WIDTH, (y + 1) * WIDTH).join("") + "\n";
  }
  screen.textContent = out;

  angle += 0.03;
  requestAnimationFrame(render);
}

(async () => {
  vertices = await loadOBJ("cheezburger.obj");
  render();
})();
