(function () {
  const data = window.PORTFOLIO;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) if (child) node.append(child);
    return node;
  };

  const chips = (items) => el("div", { class: "chips" }, items.map((t) => el("span", { class: "chip", text: t })));

  const link = (href, text, cls) =>
    el("a", { href, text, target: "_blank", rel: "noopener noreferrer", ...(cls ? { class: cls } : {}) });

  // Small inline icons (stroke style, inherit currentColor).
  const icon = (paths, size = 18) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const ICONS = {
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    api: '<path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/><path d="M12 12v5M9.5 14.5h5"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5 7 22l5-3 5 3-1.5-7.5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  };

  // Logos for known skills (vendored from devicon, MIT) and fallbacks for the rest.
  const SKILL_ICONS = {
    python: "python", java: "java", php: "php", javascript: "javascript", "vue.js": "vue", vite: "vite",
    html: "html", css: "css", django: "django", aws: "aws", git: "git",
  };
  const SKILL_FALLBACK = { sql: "db", "oracle sql": "db", "api development": "api", "back-end web development": "server", "aws cloudformation": "cloud" };

  const skillIcon = (name) => {
    const key = name.toLowerCase();
    if (SKILL_ICONS[key]) return el("img", { class: "skill-icon", src: `assets/icons/${SKILL_ICONS[key]}.svg`, alt: "", loading: "lazy" });
    return el("span", { class: "skill-icon mono", html: icon(ICONS[SKILL_FALLBACK[key]] || ICONS.api) });
  };

  // ── Hero & basics ──
  const initials = data.name.split(/\s+/).map((w) => w[0]).join("").toLowerCase();
  document.title = `${data.name} · Portfolio`;
  $("logo").textContent = `<${initials} />`;
  $("hero-name").textContent = data.name;
  $("hero-tagline").textContent = data.tagline;
  $("hero-location-text").textContent = data.location || "";
  $("hero-location").hidden = !data.location;
  if (data.photo) {
    const img = $("hero-photo");
    img.src = data.photo;
    img.alt = `Photo of ${data.name}`;
    $("hero-visual").hidden = false;
  }
  $("badge").hidden = !data.available;
  $("footer-name").textContent = data.name;
  $("year").textContent = new Date().getFullYear();

  // Typewriter cycling through roles.
  const roles = data.roles && data.roles.length ? data.roles : [data.role];
  const roleEl = $("hero-role");
  if (reduceMotion || roles.length === 1) {
    roleEl.textContent = roles[0];
  } else {
    let r = 0, i = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      i += deleting ? -1 : 1;
      roleEl.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 1800; }
      else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 300; }
      setTimeout(tick, delay);
    };
    tick();
  }

  // ── Stats (count up when visible) ──
  const stats = data.stats || [];
  $("stats").append(
    ...stats.map((s) =>
      el("div", { class: "stat" }, [
        el("div", { class: "stat-value", "data-value": s.value, "data-decimals": s.decimals || 0, "data-prefix": s.prefix || "", "data-suffix": s.suffix || "",
          text: `${s.prefix || ""}${s.value.toFixed(s.decimals || 0)}${s.suffix || ""}` }),
        el("div", { class: "stat-label", text: s.label }),
      ])
    )
  );
  if (!stats.length) $("stats").parentElement.hidden = true;
  const countUp = (node) => {
    if (reduceMotion) return;
    const target = +node.dataset.value, dec = +node.dataset.decimals, pre = node.dataset.prefix, suf = node.dataset.suffix;
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - t, 3);
      node.textContent = `${pre}${(target * eased).toFixed(dec)}${suf}`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ── About + code card ──
  $("about-body").append(...data.about.map((p) => el("p", { text: p })));
  const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const topSkills = Object.values(data.skills).flat().slice(0, 4).map((s) => `<span class="tk-s">"${esc(s)}"</span>`).join(", ");
  const current = data.experience.find((x) => x.current) || data.experience[0];
  $("code-body").innerHTML = [
    `<span class="tk-k">const</span> <span class="tk-v">engineer</span> = {`,
    `  <span class="tk-p">name</span>: <span class="tk-s">"${esc(data.name)}"</span>,`,
    current ? `  <span class="tk-p">role</span>: <span class="tk-s">"${esc(current.title)} @ ${esc(current.org)}"</span>,` : "",
    data.location ? `  <span class="tk-p">based</span>: <span class="tk-s">"${esc(data.location.split(",")[0])}"</span>,` : "",
    `  <span class="tk-p">stack</span>: [${topSkills}],`,
    `  <span class="tk-p">openToWork</span>: <span class="tk-k">${data.available ? "true" : "false"}</span>,`,
    `};`,
    ``,
    `<span class="tk-c">// translating business into buildable tech</span>`,
    `<span class="tk-v">engineer</span>.<span class="tk-p">build</span>(<span class="tk-s">"something great"</span>);`,
  ].filter((l) => l !== "").join("\n").replace("};\n<span", "};\n\n<span");

  // ── Skills ──
  $("skills-body").append(
    ...Object.entries(data.skills).map(([group, items]) =>
      el("div", { class: "skill-group glass" }, [
        el("h3", { text: group }),
        el("div", { class: "skill-list" }, items.map((s) => el("div", { class: "skill" }, [skillIcon(s), el("span", { text: s })]))),
      ])
    )
  );

  // ── Projects ──
  const projectCard = (p) => {
    const links = el("div", { class: "card-links" });
    if (p.repo) links.append(link(p.repo, "Code →"));
    if (p.live) links.append(link(p.live, "Live demo →"));
    return el("article", { class: "card glass" }, [
      el("div", { class: "card-art", "aria-hidden": "true" }, [el("div", { class: "window", html: "<i></i><i></i><i></i><i></i>" })]),
      el("div", { class: "card-body" }, [
        el("h3", { text: p.title }),
        el("p", { text: p.description }),
        p.tags && p.tags.length ? chips(p.tags) : null,
        links.children.length ? links : null,
      ]),
    ]);
  };
  $("projects-body").append(...data.projects.map(projectCard));
  $("projects").hidden = !data.projects.length;

  // ── Experience ──
  const LOGO_STYLES = {
    ey: "background:#2e2e38;color:#ffe600",
  };
  const GRADS = [
    "linear-gradient(135deg,#6366f1,#a855f7)",
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
    "linear-gradient(135deg,#10b981,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
  ];
  const orgInitials = (org) => {
    const words = org.replace(/\b(inc|ltd|llc|limited)\b\.?/gi, "").trim().split(/\s+/);
    if (words.length === 1 && words[0].length <= 3) return words[0].toUpperCase();
    return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  };
  $("experience-body").append(
    ...data.experience.map((x, idx) => {
      const style = LOGO_STYLES[x.org.toLowerCase()] || `background:${GRADS[idx % GRADS.length]}`;
      return el("li", {}, [
        el("div", { class: "org-logo", style, text: orgInitials(x.org), "aria-hidden": "true" }),
        el("div", { class: "job glass" }, [
          el("div", { class: "job-head" }, [
            el("h3", {}, [
              document.createTextNode(`${x.title} · `),
              el("span", { class: "org", text: x.org }),
              x.current ? el("span", { class: "now", text: "Current" }) : null,
            ]),
            el("span", { class: "period", text: x.period }),
          ]),
          x.place ? el("div", { class: "place", html: icon(ICONS.pin, 14) }, [el("span", { text: x.place })]) : null,
          el("p", { text: x.details }),
        ]),
      ]);
    })
  );

  // ── Education (with score gauges) & certifications ──
  const gauge = (score, outOf) => {
    const r = 38, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, score / outOf));
    const id = `g${Math.random().toString(36).slice(2, 8)}`;
    const wrap = el("div", { class: "gauge", "data-offset": c * (1 - pct) });
    wrap.innerHTML = `
      <svg viewBox="0 0 92 92" width="92" height="92" aria-hidden="true">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
        <circle class="track" cx="46" cy="46" r="${r}" fill="none" stroke-width="8"/>
        <circle class="fill" cx="46" cy="46" r="${r}" fill="none" stroke-width="8" stroke="url(#${id})"
          stroke-dasharray="${c}" stroke-dashoffset="${reduceMotion ? c * (1 - pct) : c}"/>
      </svg>
      <div class="gauge-label"><b>${score}</b><small>of ${outOf}</small></div>`;
    return wrap;
  };
  $("education-body").append(
    ...(data.education || []).map((e) =>
      el("article", { class: "edu glass" }, [
        el("div", {}, [
          el("div", { class: "edu-period", text: e.period }),
          el("h3", { text: e.title }),
          el("div", { class: "edu-org", text: e.org }),
          e.details ? el("p", { text: e.details }) : null,
        ]),
        e.score && e.outOf ? gauge(e.score, e.outOf) : null,
      ])
    )
  );
  const certs = data.certifications || [];
  if (certs.length) {
    $("certs-body").append(
      ...certs.map((c, i) =>
        el("li", { class: "cert glass" }, [
          el("div", { class: "cert-icon", html: icon(i % 2 ? ICONS.shield : ICONS.award, 22) }),
          el("div", {}, [el("strong", { text: c.title }), el("span", { text: `${c.issuer} · ${c.date}` })]),
        ])
      )
    );
    $("certs-wrap").hidden = false;
  }

  // ── Contact ──
  const c = data.contact;
  const contactLinks = [];
  if (c.email) contactLinks.push(el("a", { href: `mailto:${c.email}`, class: "btn btn-primary", text: "Say hello ✉" }));
  if (c.linkedin) contactLinks.push(link(c.linkedin, "LinkedIn", "btn btn-ghost"));
  if (c.twitter) contactLinks.push(link(c.twitter, "X / Twitter", "btn btn-ghost"));
  $("contact-body").append(...contactLinks);
  if (!contactLinks.length) {
    // Nothing to contact through yet: hide the section and links pointing at it.
    $("contact").hidden = true;
    $("hero-contact").hidden = true;
    document.querySelector('.nav-links a[href="#contact"]').hidden = true;
  }

  // ── Theme toggle ──
  const root = document.documentElement;
  $("theme-toggle").addEventListener("click", () => {
    const cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ── Mobile menu ──
  const nav = $("nav-links");
  const menuBtn = $("menu-toggle");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // ── Cursor spotlight + per-card glow ──
  const spot = $("spotlight");
  if (matchMedia("(pointer: fine)").matches && !reduceMotion) {
    addEventListener("pointermove", (e) => {
      spot.style.left = `${e.clientX}px`;
      spot.style.top = `${e.clientY}px`;
    }, { passive: true });
  }
  document.querySelectorAll(".glass").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // ── Scroll progress + active nav link ──
  const bar = $("progress");
  const links = [...nav.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    let active = -1;
    sections.forEach((s, i) => { if (s && !s.hidden && s.getBoundingClientRect().top < 140) active = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === active));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Reveal sections on scroll, then run their animations ──
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) reveal(e.target);
      }),
    { threshold: 0, rootMargin: "0px 0px -8% 0px" }
  );
  const reveal = (s) => {
    if (s.classList.contains("visible")) return;
    s.classList.add("visible");
    s.querySelectorAll(".stat-value").forEach(countUp);
    s.querySelectorAll(".gauge").forEach((g) => { g.querySelector(".fill").style.strokeDashoffset = g.dataset.offset; });
    io.unobserve(s);
  };
  const revealables = [...document.querySelectorAll(".reveal")];
  revealables.forEach((s) => io.observe(s));
  // Safety net: anything already scrolled into or past view gets revealed even if the observer missed it.
  addEventListener("scroll", () => revealables.forEach((s) => s.getBoundingClientRect().top < innerHeight && reveal(s)), { passive: true });
})();
