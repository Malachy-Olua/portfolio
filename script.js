const root = document.documentElement;
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll reveal + stat counters
const countUp = (el) => {
  const target = +el.dataset.count, suffix = el.dataset.suffix || "";
  if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
  const start = performance.now(), dur = 1400;
  const tick = (t) => {
    const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-count]", e.target).forEach(countUp);
    revealer.unobserve(e.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealer.observe(el);
});

// Background tone + active nav link follow the section in view
const links = $$(".pill-nav a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    root.dataset.tone = e.target.dataset.tone;
    links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -45% 0px" });
$$("main > section").forEach((s) => sectionObserver.observe(s));

// Project showcase
const slides = $$(".slide");
const dotsWrap = document.querySelector(".dots");
const acTitle = document.getElementById("ac-title");
const acMeta = document.getElementById("ac-meta");
const acLink = document.getElementById("ac-link");
const acDetails = document.getElementById("ac-details");
const thumb = document.querySelector(".thumb");
let current = 0, timer;

slides.forEach((_, i) => {
  const b = document.createElement("button");
  b.setAttribute("role", "tab");
  b.setAttribute("aria-label", `Project ${i + 1}`);
  b.addEventListener("click", () => { show(i); restart(); });
  dotsWrap.appendChild(b);
});
function show(i) {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle("active", n === current));
  $$("button", dotsWrap).forEach((b, n) => b.setAttribute("aria-selected", n === current));
  const s = slides[current].dataset;
  acTitle.textContent = s.title;
  acMeta.textContent = s.meta;
  acLink.href = s.link;
  acDetails.href = s.details;
  thumb.style.backgroundImage = s.img ? `url("${s.img}")` : "";
}
function restart() {
  clearInterval(timer);
  if (!reduced) timer = setInterval(() => show(current + 1), 5000);
}
document.querySelector(".showcase").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") { show(current + 1); restart(); }
  if (e.key === "ArrowLeft") { show(current - 1); restart(); }
});
show(0);
restart();

document.getElementById("year").textContent = new Date().getFullYear();
