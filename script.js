(function () {
  const data = window.PORTFOLIO;
  const $ = (id) => document.getElementById(id);

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) if (child) node.append(child);
    return node;
  };

  const chips = (items) => el("div", { class: "chips" }, items.map((t) => el("span", { class: "chip", text: t })));

  const link = (href, text, cls) =>
    el("a", { href, text, target: "_blank", rel: "noopener noreferrer", ...(cls ? { class: cls } : {}) });

  // ── Hero & basics ──
  const initials = data.name.split(/\s+/).map((w) => w[0]).join("").toLowerCase();
  document.title = `${data.name} · ${data.role}`;
  $("logo").textContent = `<${initials} />`;
  $("hero-name").textContent = data.name;
  $("hero-role").textContent = data.role;
  $("hero-tagline").textContent = data.tagline;
  $("hero-location").textContent = data.location ? `📍 ${data.location}` : "";
  if (data.photo) {
    const img = $("hero-photo");
    img.src = data.photo;
    img.alt = `Photo of ${data.name}`;
    img.hidden = false;
  }
  $("badge").hidden = !data.available;
  $("footer-name").textContent = data.name;
  $("year").textContent = new Date().getFullYear();

  // ── About ──
  $("about-body").append(...data.about.map((p) => el("p", { text: p })));

  // ── Skills ──
  $("skills-body").append(
    ...Object.entries(data.skills).map(([group, items]) =>
      el("div", { class: "skill-group" }, [el("h3", { text: group }), chips(items)])
    )
  );

  // ── Projects ──
  const projectCard = (p) => {
    const links = el("div", { class: "card-links" });
    if (p.repo) links.append(link(p.repo, "Code →"));
    if (p.live) links.append(link(p.live, "Live demo →"));
    return el("article", { class: "card" }, [
      el("h3", { text: p.title }),
      el("p", { text: p.description }),
      p.tags && p.tags.length ? chips(p.tags) : null,
      links,
    ]);
  };
  $("projects-body").append(...data.projects.map(projectCard));

  // ── Experience ──
  $("experience-body").append(
    ...data.experience.map((x) =>
      el("li", {}, [
        el("h3", {}, [document.createTextNode(`${x.title} · `), el("span", { class: "org", text: x.org })]),
        el("div", { class: "period", text: x.period }),
        x.place ? el("div", { class: "place", text: x.place }) : null,
        el("p", { text: x.details }),
      ])
    )
  );

  // ── Education & certifications ──
  $("education-body").append(
    ...(data.education || []).map((e) =>
      el("article", { class: "card" }, [
        el("div", { class: "edu-period", text: e.period }),
        el("h3", { text: e.title }),
        el("div", { class: "edu-org", text: e.org }),
        e.details ? el("p", { text: e.details }) : null,
      ])
    )
  );
  const certs = data.certifications || [];
  if (certs.length) {
    $("certs-body").append(
      ...certs.map((c) => el("li", {}, [el("strong", { text: c.title }), el("span", { text: `${c.issuer} · ${c.date}` })]))
    );
    $("certs-wrap").hidden = false;
  }

  // ── Contact ──
  const c = data.contact;
  const contactLinks = [];
  if (c.email) contactLinks.push(el("a", { href: `mailto:${c.email}`, class: "btn btn-primary", text: "Say hello ✉" }));
  if (c.github) contactLinks.push(link(c.github, "GitHub", "btn btn-ghost"));
  if (c.linkedin) contactLinks.push(link(c.linkedin, "LinkedIn", "btn btn-ghost"));
  if (c.twitter) contactLinks.push(link(c.twitter, "X / Twitter", "btn btn-ghost"));
  $("contact-body").append(...contactLinks);

  // ── Live GitHub repos (hidden if none or if the request fails) ──
  if (data.githubUser) {
    fetch(`https://api.github.com/users/${encodeURIComponent(data.githubUser)}/repos?sort=updated&per_page=6`)
      .then((r) => (r.ok ? r.json() : []))
      .then((repos) => {
        const listed = new Set(data.projects.map((p) => (p.repo || "").toLowerCase()));
        const fresh = repos.filter((r) => !r.fork && !listed.has(r.html_url.toLowerCase()));
        if (!fresh.length) return;
        $("github-body").append(
          ...fresh.map((r) => {
            const meta = [r.language, `★ ${r.stargazers_count}`].filter(Boolean).join("  ·  ");
            return el("article", { class: "card" }, [
              el("h3", { text: r.name }),
              el("p", { text: r.description || "No description yet." }),
              el("div", { class: "card-meta", text: meta }),
              el("div", { class: "card-links", style: "margin-top:14px" }, [link(r.html_url, "View repo →")]),
            ]);
          })
        );
        $("github-wrap").hidden = false;
      })
      .catch(() => {});
  }

  // ── Theme toggle ──
  const root = document.documentElement;
  $("theme-toggle").addEventListener("click", () => {
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
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

  // ── Reveal sections on scroll ──
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("visible"), io.unobserve(e.target))),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((s) => io.observe(s));
})();
