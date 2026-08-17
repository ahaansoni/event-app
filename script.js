/* =========================================================
   Sabha — site interactions. No dependencies, no build step.
   ========================================================= */
(function () {
  "use strict";
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── year ── */
  $("#yr").textContent = new Date().getFullYear();

  /* ── sticky header shade ── */
  var bar = $("#bar");
  var onScroll = function () {
    bar.classList.toggle("stuck", window.scrollY > 10);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── mobile nav ── */
  var burger = $("#burger"),
    nav = $("#nav");
  var setNav = function (open) {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  };
  burger.addEventListener("click", function () {
    setNav(nav.classList.contains("open") === false);
  });
  $$("#nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      setNav(false);
    });
  });

  /* =========================================================
     SEASON RIBBON
     Statuses: 'open' | 'few' | 'full'.  mu = auspicious date.
     Swap this object for real data (or an API call) when the
     client's calendar is connected.
     ========================================================= */
  var SEASON = [
    {
      key: "nov",
      label: "Nov 2026",
      year: 2026,
      month: 10,
      days: [
        { d: 14, s: "few", mu: 1 },
        { d: 15, s: "open" },
        { d: 19, s: "full" },
        { d: 20, s: "full", mu: 1 },
        { d: 21, s: "few" },
        { d: 24, s: "open" },
        { d: 25, s: "open", mu: 1 },
        { d: 28, s: "few" },
        { d: 29, s: "open" },
        { d: 30, s: "open" },
      ],
    },
    {
      key: "dec",
      label: "Dec 2026",
      year: 2026,
      month: 11,
      days: [
        { d: 2, s: "open" },
        { d: 4, s: "few", mu: 1 },
        { d: 5, s: "full" },
        { d: 6, s: "few" },
        { d: 10, s: "open" },
        { d: 11, s: "open", mu: 1 },
        { d: 14, s: "open" },
        { d: 20, s: "few" },
        { d: 26, s: "open" },
        { d: 31, s: "full" },
      ],
    },
    {
      key: "jan",
      label: "Jan 2027",
      year: 2027,
      month: 0,
      days: [
        { d: 16, s: "open" },
        { d: 17, s: "open", mu: 1 },
        { d: 20, s: "few" },
        { d: 21, s: "open" },
        { d: 22, s: "full" },
        { d: 25, s: "open" },
        { d: 26, s: "few", mu: 1 },
        { d: 29, s: "open" },
        { d: 30, s: "open" },
        { d: 31, s: "open" },
      ],
    },
    {
      key: "feb",
      label: "Feb 2027",
      year: 2027,
      month: 1,
      days: [
        { d: 4, s: "open" },
        { d: 5, s: "few" },
        { d: 6, s: "open", mu: 1 },
        { d: 11, s: "open" },
        { d: 12, s: "few" },
        { d: 14, s: "full", mu: 1 },
        { d: 18, s: "open" },
        { d: 19, s: "open" },
        { d: 24, s: "few" },
        { d: 26, s: "open" },
      ],
    },
  ];
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var tabsEl = $("#seasonTabs"),
    railEl = $("#seasonRail");

  function drawRail(m) {
    railEl.innerHTML = "";
    m.days.forEach(function (day) {
      var dt = new Date(m.year, m.month, day.d);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "day " + day.s + (day.mu ? " mu" : "");
      b.innerHTML =
        '<span class="day-d">' +
        day.d +
        "</span>" +
        '<span class="day-w">' +
        WD[dt.getDay()] +
        "</span>" +
        '<i class="dot"></i>';
      var status =
        day.s === "full"
          ? "booked"
          : day.s === "few"
            ? "few slots left"
            : "open";
      b.setAttribute(
        "aria-label",
        day.d +
          " " +
          m.label +
          " — " +
          status +
          (day.mu ? ", auspicious date" : ""),
      );
      if (day.s === "full") {
        b.disabled = true;
      } else {
        b.addEventListener("click", function () {
          var iso =
            m.year +
            "-" +
            String(m.month + 1).padStart(2, "0") +
            "-" +
            String(day.d).padStart(2, "0");
          var input = $("#f-date");
          input.value = iso;
          document
            .getElementById("enquire")
            .scrollIntoView({
              behavior: reduced ? "auto" : "smooth",
              block: "start",
            });
          setTimeout(
            function () {
              $("#f-name").focus({ preventScroll: true });
            },
            reduced ? 0 : 600,
          );
          setStatus(
            "Date held for this enquiry: " + day.d + " " + m.label + ".",
            "ok",
          );
        });
      }
      railEl.appendChild(b);
    });
  }

  SEASON.forEach(function (m, i) {
    var t = document.createElement("button");
    t.type = "button";
    t.className = "season-tab" + (i === 0 ? " is-on" : "");
    t.textContent = m.label;
    t.addEventListener("click", function () {
      $$(".season-tab", tabsEl).forEach(function (x) {
        x.classList.remove("is-on");
      });
      t.classList.add("is-on");
      drawRail(m);
    });
    tabsEl.appendChild(t);
  });
  drawRail(SEASON[0]);

  /* =========================================================
     GALLERY
     Drop photos into images/ as work-1.jpg … work-8.jpg.
     Missing files fall back to a pattern tile automatically.
     ========================================================= */
  var WORK = [
    {
      f: "work-1.jpg",
      cat: "wedding",
      t: "Meghna & Arjun",
      k: "4 functions · 600 guests · Amer road",
    },
    {
      f: "work-2.jpg",
      cat: "corporate",
      t: "Annual day",
      k: "IT services · 900 guests · convention hall",
    },
    {
      f: "work-3.jpg",
      cat: "wedding",
      t: "Palace pheras",
      k: "Courtyard mandap · 380 guests",
    },
    {
      f: "work-4.jpg",
      cat: "fest",
      t: "Campus festival",
      k: "3 stages · 4000 footfall",
    },
    {
      f: "work-5.jpg",
      cat: "celebration",
      t: "Sixtieth birthday",
      k: "80 guests · Civil Lines courtyard",
    },
    {
      f: "work-6.jpg",
      cat: "wedding",
      t: "Sangeet night",
      k: "LED wall · live band · 500 guests",
    },
    {
      f: "work-7.jpg",
      cat: "corporate",
      t: "Dealer meet",
      k: "Auto brand · 2 days · resort buyout",
    },
    {
      f: "work-8.jpg",
      cat: "celebration",
      t: "Silver anniversary",
      k: "Garden dinner · 150 guests",
    },
  ];
  var gal = $("#gallery");
  WORK.forEach(function (w, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tile";
    b.dataset.cat = w.cat;
    b.dataset.i = i;
    b.innerHTML =
      '<img src="images/' +
      w.f +
      '" alt="" loading="lazy">' +
      '<span class="tile-cap"><b>' +
      w.t +
      "</b><span>" +
      w.k +
      "</span></span>";
    b.querySelector("img").addEventListener("error", function () {
      b.classList.add("no-img");
    });
    b.addEventListener("click", function () {
      openLb(i);
    });
    gal.appendChild(b);
  });

  $$(".chip").forEach(function (c) {
    c.addEventListener("click", function () {
      $$(".chip").forEach(function (x) {
        x.classList.remove("is-on");
      });
      c.classList.add("is-on");
      var f = c.dataset.filter;
      $$(".tile").forEach(function (t) {
        t.classList.toggle("hide", f !== "all" && t.dataset.cat !== f);
      });
    });
  });

  /* ── lightbox ── */
  var lb = $("#lb"),
    lbMedia = $("#lbMedia"),
    lbCap = $("#lbCap"),
    cur = 0,
    lastFocus = null;
  function renderLb() {
    var w = WORK[cur];
    lbMedia.innerHTML = "";
    lbMedia.classList.remove("no-img");
    var im = new Image();
    im.alt = w.t;
    im.addEventListener("error", function () {
      im.remove();
      lbMedia.classList.add("no-img");
    });
    im.src = "images/" + w.f;
    lbMedia.appendChild(im);
    lbCap.textContent = w.t + " — " + w.k;
  }
  function openLb(i) {
    cur = i;
    lastFocus = document.activeElement;
    renderLb();
    lb.hidden = false;
    document.body.classList.add("nav-open");
    $("#lbX").focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.classList.remove("nav-open");
    if (lastFocus) {
      lastFocus.focus();
    }
  }
  function step(n) {
    cur = (cur + n + WORK.length) % WORK.length;
    renderLb();
  }
  $("#lbX").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", function () {
    step(-1);
  });
  $("#lbNext").addEventListener("click", function () {
    step(1);
  });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) {
      closeLb();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) {
      return;
    }
    if (e.key === "Escape") {
      closeLb();
    }
    if (e.key === "ArrowLeft") {
      step(-1);
    }
    if (e.key === "ArrowRight") {
      step(1);
    }
  });

  /* =========================================================
     TESTIMONIAL CAROUSEL
     ========================================================= */
  var quotes = $$(".quote"),
    dotsEl = $("#quoteDots"),
    qi = 0,
    timer;
  quotes.forEach(function (q, i) {
    var d = document.createElement("button");
    d.type = "button";
    d.className = "qdot" + (i === 0 ? " is-on" : "");
    d.setAttribute("aria-label", "Testimonial " + (i + 1));
    d.addEventListener("click", function () {
      show(i);
      restart();
    });
    dotsEl.appendChild(d);
  });
  function show(i) {
    qi = i;
    quotes.forEach(function (q, n) {
      q.classList.toggle("is-on", n === i);
    });
    $$(".qdot").forEach(function (d, n) {
      d.classList.toggle("is-on", n === i);
    });
  }
  function restart() {
    clearInterval(timer);
    if (!reduced) {
      timer = setInterval(function () {
        show((qi + 1) % quotes.length);
      }, 6500);
    }
  }
  restart();

  /* =========================================================
     REVEAL + COUNTERS
     ========================================================= */
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) {
            return;
          }
          var group = $$(".reveal", e.target);
          (group.length ? group : [e.target]).forEach(function (el, i) {
            setTimeout(function () {
              el.classList.add("in");
            }, i * 80);
          });
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    $$(".reveal-group").forEach(function (g) {
      io.observe(g);
    });
  } else {
    $$(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }

  var statsSeen = false;
  function runCounters() {
    if (statsSeen) {
      return;
    }
    statsSeen = true;
    $$(".num").forEach(function (el) {
      var to = parseInt(el.dataset.to, 10),
        sfx = el.dataset.suffix || "";
      if (reduced) {
        el.textContent = to + sfx;
        return;
      }
      var t0 = null,
        dur = 1400;
      requestAnimationFrame(function tick(ts) {
        if (!t0) {
          t0 = ts;
        }
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + sfx;
        if (p < 1) {
          requestAnimationFrame(tick);
        }
      });
    });
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (es) {
        if (es[0].isIntersecting) {
          runCounters();
        }
      },
      { threshold: 0.35 },
    ).observe($("#stats"));
  } else {
    runCounters();
  }

  /* =========================================================
     ENQUIRY FORM
     Uses Web3Forms. Paste your access key into the hidden
     access_key input in index.html and it sends real email.
     Until then it runs in demo mode and just confirms on screen.
     ========================================================= */
  var form = $("#enqForm"),
    statusEl = $("#fStatus");
  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "f-status " + (kind || "");
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      setStatus("Please fill in your name, phone and email.", "bad");
      var bad = form.querySelector(":invalid");
      if (bad) {
        bad.focus();
      }
      return;
    }
    var endpoint = (form.getAttribute("action") || "").trim();
    var btn = form.querySelector('button[type="submit"]');

    if (!endpoint || endpoint.indexOf("YOUR_ID") > -1) {
      setStatus(
        "Thanks — enquiry received. We reply within one working day. (Demo mode: no email sent yet.)",
        "ok",
      );
      form.reset();
      return;
    }

    btn.disabled = true;
    setStatus("Sending…", "");
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    })
      .then(function (r) {
        // Formspree returns 200 with {ok:true}; Web3Forms returns {success:true}
        return r.json().then(function (d) {
          return {
            ok: r.ok && d.error === undefined && d.success !== false,
            data: d,
          };
        });
      })
      .then(function (res) {
        if (res.ok) {
          setStatus(
            "Thanks — enquiry received. We reply within one working day.",
            "ok",
          );
          form.reset();
        } else {
          setStatus(
            "That did not go through. Please call +91 00000 00000 instead.",
            "bad",
          );
        }
      })
      .catch(function () {
        setStatus(
          "Network problem. Please call +91 00000 00000 instead.",
          "bad",
        );
      })
      .finally(function () {
        btn.disabled = false;
      });
  });

  /* =========================================================
     DEMO PANEL
     Delete these elements (and this block) when the site goes live.
     ========================================================= */
  var panel = $("#demoPanel"),
    scrim = $("#demoScrim"),
    dBtn = $("#demoBtn");
  function setPanel(open) {
    if (open) {
      panel.hidden = false;
      scrim.hidden = false;
      requestAnimationFrame(function () {
        panel.classList.add("open");
      });
    } else {
      panel.classList.remove("open");
      setTimeout(function () {
        panel.hidden = true;
        scrim.hidden = true;
      }, 340);
    }
    dBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  }
  dBtn.addEventListener("click", function () {
    setPanel(panel.hidden);
  });
  $("#demoX").addEventListener("click", function () {
    setPanel(false);
  });
  scrim.addEventListener("click", function () {
    setPanel(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) {
      setPanel(false);
    }
  });
})();
