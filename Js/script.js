var F = [
  {
    c: "Brasileirão Série A 2026",
    d: "2026-09-19T20:30:00-03:00",
    h: "Vasco",
    a: "Coritiba",
    v: "São Januário",
    s: [5, 0],
  },
  {
    c: "Brasileirão Série A 2026",
    d: "2026-10-07T20:30:00-03:00",
    h: "Botafogo",
    a: "Vasco",
    v: "Estádio Nilton Santos",
  },
  {
    c: "Brasileirão Série A 2026",
    d: "2026-10-10T17:00:00-03:00",
    h: "Vasco",
    a: "Remo",
    v: "São Januário",
  },
  {
    c: "Copa Sul-Americana",
    d: "2026-10-13T21:30:00-03:00",
    h: "Boca Juniors",
    a: "Vasco",
    v: "Estádio Alberto José Armando",
  },
];
var fmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});
function ini(n) {
  return n === "Vasco"
    ? "V"
    : n
        .split(" ")
        .map(function (w) {
          return w[0];
        })
        .join("")
        .slice(0, 2);
}
function badge(n) {
  return (
    '<div class="tm"><div class="bd' +
    (n === "Vasco" ? " v" : "") +
    '">' +
    ini(n) +
    "</div>" +
    n +
    "</div>"
  );
}
var now = Date.now(),
  nx = F.find(function (f) {
    return !f.s && new Date(f.d).getTime() + 7200000 > now;
  });
var rail = document.getElementById("rail");
F.forEach(function (f) {
  var mid = f.s
    ? '<div class="sc">' + f.s[0] + " x " + f.s[1] + "</div>"
    : '<div class="sc">x</div>';
  var el = document.createElement("div");
  el.className = "g" + (f === nx ? " now" : "");
  el.innerHTML =
    "<small>" +
    f.c +
    "</small><small>" +
    fmt.format(new Date(f.d)) +
    '</small><div class="vs">' +
    badge(f.h) +
    mid +
    badge(f.a) +
    "</div><small>" +
    f.v +
    "</small>";
  rail.appendChild(el);
});
function pad(n) {
  return String(n).padStart(2, "0");
}
function tick() {
  if (!nx) return;
  var t = new Date(nx.d).getTime() - Date.now();
  if (t <= 0) {
    document.getElementById("cd").innerHTML =
      '<strong class="disp" style="font-size:44px">Bola rolando</strong>';
    return;
  }
  var s = Math.floor(t / 1000);
  document.getElementById("d").textContent = pad(Math.floor(s / 86400));
  document.getElementById("h").textContent = pad(
    Math.floor((s % 86400) / 3600),
  );
  document.getElementById("m").textContent = pad(Math.floor((s % 3600) / 60));
  document.getElementById("s").textContent = pad(s % 60);
}
if (nx) {
  document.getElementById("hComp").textContent = nx.c;
  document.getElementById("hTitle").textContent = nx.h + " x " + nx.a;
  document.getElementById("hMeta").textContent =
    fmt.format(new Date(nx.d)) + ", " + nx.v;
  tick();
  setInterval(tick, 1000);
}

(function () {
  var cv = document.getElementById("gl");
  if (!cv || !window.THREE) return;
  var T = THREE,
    r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  var sc = new T.Scene(),
    cam = new T.PerspectiveCamera(35, 1, 0.1, 50);
  var a = [
      [-0.25, 0.25],
      [-0.6, 1.5],
      [0.6, 1.5],
      [0.25, 0.25],
    ],
    sh = new T.Shape(),
    first = true;
  for (var k = 0; k < 4; k++) {
    var c = Math.cos((-k * Math.PI) / 2),
      s = Math.sin((-k * Math.PI) / 2);
    a.forEach(function (p) {
      var x = p[0] * c - p[1] * s,
        y = p[0] * s + p[1] * c;
      if (first) {
        sh.moveTo(x, y);
        first = false;
      } else sh.lineTo(x, y);
    });
  }
  sh.closePath();
  var g = new T.ExtrudeGeometry(sh, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 4,
  });
  g.center();
  var grp = new T.Group();
  grp.add(
    new T.Mesh(
      g,
      new T.MeshStandardMaterial({
        color: 0xd71920,
        metalness: 0.55,
        roughness: 0.28,
      }),
    ),
  );
  grp.add(
    new T.Mesh(
      new T.TorusGeometry(2.3, 0.05, 16, 100),
      new T.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
      }),
    ),
  );
  sc.add(grp, new T.AmbientLight(0xffffff, 0.5));
  var l1 = new T.PointLight(0xffffff, 1.2);
  l1.position.set(4, 5, 6);
  sc.add(l1);
  var l2 = new T.PointLight(0xff3040, 1, 20);
  l2.position.set(-5, -3, 3);
  sc.add(l2);
  var px = 0,
    py = 0;
  addEventListener("pointermove", function (e) {
    px = e.clientX / innerWidth - 0.5;
    py = e.clientY / innerHeight - 0.5;
  });
  function size() {
    var w = cv.clientWidth,
      h = cv.clientHeight;
    r.setSize(w, h, false);
    cam.aspect = w / h;
    cam.position.z = w / h < 1 ? 12 : 9;
    cam.updateProjectionMatrix();
  }
  addEventListener("resize", size);
  size();
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function loop(t) {
    grp.rotation.y +=
      (px * 1.2 + Math.sin(t / 1800) * 0.5 - grp.rotation.y) * 0.06;
    grp.rotation.x += (py * 0.8 - grp.rotation.x) * 0.06;
    grp.position.y = Math.sin(t / 1200) * 0.12;
    r.render(sc, cam);
    if (!still) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".g,.n,.p,.tr div").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var b = el.getBoundingClientRect(),
        x = (e.clientX - b.left) / b.width,
        y = (e.clientY - b.top) / b.height;
      el.style.setProperty("--ry", (x - 0.5) * 10 + "deg");
      el.style.setProperty("--rx", -(y - 0.5) * 10 + "deg");
      el.style.setProperty("--mx", x * 100 + "%");
      el.style.setProperty("--my", y * 100 + "%");
    });
    el.addEventListener("pointerleave", function () {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });
}
