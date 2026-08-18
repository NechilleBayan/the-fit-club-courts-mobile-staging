/* ============================================================
   THE FIT CLUB COURTS - STAGING BRIDGE
   Loaded by the customer build and by every page of the admin console.

   There are two documents in this prototype. index.html is a single-page app
   with a hash router and one live state object; admin/ is a folder of static
   pages that reload from scratch every time you click a destination. They are
   different shapes on purpose and neither is going to become the other. What
   they share is the staging harness: a handful of dials that say which role is
   being demonstrated, which scenario is armed, whether the network is pretending
   to be down, and which theme to paint in. This file is the one place those
   dials live, so a walkthrough that starts in the customer app and ends in the
   admin console does not silently start over halfway through.

   WHAT CROSSES THE BOUNDARY: DIALS, NOT ORDERS.
   The persisted shape is seven scalars and nothing else:

     { surface, scenario, connectivity, capacity, clockOffset, theme, navCollapsed }

   Six of those are harness dials. navCollapsed is not: it is a preference about
   the chrome, in the same category as the theme, and it is here for the same
   reason the theme is. The desktop sidebar exists in both documents, and a rail
   a reader collapsed in the console should still be collapsed when they land in
   the staff shell.

   Notably absent is S.orders. That is a live object graph carrying absolute
   hold deadlines, generated identifiers, and per-pass share tokens, and it is
   read and mutated by about thirty functions in index.html. Serialising it
   across a document boundary would mean freezing every one of those invariants
   into a wire format and keeping two renderers in step with it forever, which
   is a larger project than the console it would be serving. So the admin pages
   receive a scenario KEY and render their own sample for it. Same scenario, two
   independent renderings, no shared object graph and nothing to drift.

   The corollary is worth stating plainly, because the harness copy now has to
   say it: A dial survives a refresh and a jump between the two builds. A
   booking does not. Reload the customer app mid-checkout and the order is gone,
   exactly as before.

   One key, one shape, validated on read. This is a sandbox with a harness whose
   whole job is forcing odd states, and localStorage is a text field anyone can
   edit; a value that is not one of the ones the code handles is discarded
   rather than passed through to a screen that has no branch for it.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "tfc-staging";

  /* The theme's old home. Read once at first init so a preference set before
     this file existed is carried forward rather than silently dropped, then
     removed, because the point of this file is that there is one source of
     truth and a mirror is two. */
  var LEGACY_THEME_KEY = "tfc-theme";
  /* NOT A DIAL, AND DELIBERATELY NOT IN THE RECORD ABOVE.
     The staging notice is shown once per sitting and then not again, which is a
     different lifetime from everything else this file holds. The dials are a
     preference: a reader who chose the night theme this morning wants it this
     afternoon and on the other half of the product, so they live in
     localStorage and survive a close. "I have read the notice" is not a
     preference, it is a fact about this arrival. Persisted, it would mean
     somebody who saw the notice once in March never sees it again on a build
     that changes underneath them, which is the opposite of what it is for.

     sessionStorage is the lifetime that matches, and its per-tab scope is right
     for the same reason: A second tab is a second arrival. It goes through this
     file rather than being read at each call site because that is the rule this
     file exists to enforce, and because there are two documents and there must
     be one answer. */
  var NOTICE_KEY = "tfc-staging-notice";
  /* The in-memory half is not a fallback, it is the part that makes the
     customer build correct. That document is one page with hash routes, so
     "once per session" there means once per load and not once per route, and a
     flag in this closure is what says so even where storage is refused. */
  var noticeSeen = false;

  /* The allowed values, which double as the validator. Anything not on these
     lists falls back to the default. */
  var ALLOWED = {
    surface:      ["visitor", "player", "frontdesk", "opsmanager"],
    connectivity: ["online", "availability_down", "payments_down", "maintenance"],
    capacity:     ["available", "almost", "full"],
    theme:        ["system", "light", "dark"]
  };

  /* scenario is validated against the harness's own list rather than a copy
     kept here, because a copy would be a second place to add a scenario and
     therefore a place to forget to. The harness registers its keys at boot; an
     admin page, which has no scenario table of its own, accepts any string and
     lets its own hydration decide whether it recognises it. */
  var scenarioKeys = null;

  /* theme defaults to null rather than to a colour, and the distinction is load
     bearing. null means nobody has chosen, so each build keeps the default it
     ships with: the customer app is pinned dark in its markup, the console
     follows the operating system. An explicit choice, once made anywhere,
     applies everywhere. Defaulting to a colour instead would have repainted one
     of the two builds for a reader who never asked for it. */
  var DEFAULTS = {
    surface: "visitor",
    scenario: null,
    connectivity: "online",
    capacity: "available",
    clockOffset: 0,
    theme: null,
    navCollapsed: false
  };

  var subs = [];

  /* A private window, a disabled-storage policy, or a quota that is already
     full all throw on the first touch. None of that is worth breaking a
     prototype over, so storage is treated as a cache in front of memory: the
     dials still work for the length of the session, they simply stop crossing
     the boundary. */
  var mem = null;
  var storageOk = (function () {
    try {
      window.localStorage.setItem(KEY + "-probe", "1");
      window.localStorage.removeItem(KEY + "-probe");
      return true;
    } catch (e) { return false; }
  })();

  function clone(o) {
    return { surface: o.surface, scenario: o.scenario, connectivity: o.connectivity,
             capacity: o.capacity, clockOffset: o.clockOffset, theme: o.theme,
             navCollapsed: o.navCollapsed };
  }

  function pick(list, v, fallback) {
    return list.indexOf(v) >= 0 ? v : fallback;
  }

  /* Every read goes through here, so a value that arrived from a hand edit, an
     older version of this file, or a half-written write is normalised in one
     place instead of at each call site. */
  function normalise(raw) {
    var s = clone(DEFAULTS);
    if (!raw || typeof raw !== "object") return s;

    s.surface      = pick(ALLOWED.surface, raw.surface, DEFAULTS.surface);
    s.connectivity = pick(ALLOWED.connectivity, raw.connectivity, DEFAULTS.connectivity);
    s.capacity     = pick(ALLOWED.capacity, raw.capacity, DEFAULTS.capacity);
    s.theme        = raw.theme === null || raw.theme === undefined
                       ? null
                       : pick(ALLOWED.theme, raw.theme, null);

    /* A clock offset is milliseconds of simulated drift, not a date, and it is
       held in milliseconds because that is the unit the customer build's now()
       adds it to. Anything that is not a finite number is nonsense, and a
       negative offset would run the venue backwards past bookings that have
       already been checked in. */
    var off = Number(raw.clockOffset);
    s.clockOffset = isFinite(off) && off >= 0 ? off : 0;

    s.navCollapsed = raw.navCollapsed === true;

    if (typeof raw.scenario === "string" && raw.scenario) {
      s.scenario = (scenarioKeys && scenarioKeys.indexOf(raw.scenario) < 0) ? null : raw.scenario;
    } else {
      s.scenario = null;
    }
    return s;
  }

  function read() {
    if (mem) return clone(mem);
    var raw = null;
    if (storageOk) {
      try { raw = JSON.parse(window.localStorage.getItem(KEY) || "null"); }
      catch (e) { raw = null; }
    }
    var s = normalise(raw);

    /* First init on a browser that has a theme from before this file existed.
       Adopt it, write it into the one key, and drop the old one. */
    if (s.theme === null && storageOk) {
      var old = null;
      try { old = window.localStorage.getItem(LEGACY_THEME_KEY); } catch (e) {}
      if (old === "dark" || old === "light") {
        s.theme = old;
        mem = s;
        write(s);
        try { window.localStorage.removeItem(LEGACY_THEME_KEY); } catch (e) {}
        return clone(s);
      }
    }
    mem = s;
    return clone(s);
  }

  function write(s) {
    mem = clone(s);
    if (!storageOk) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {}
  }

  /* origin is "local" when this document moved the dial and "remote" when the
     move arrived from another one. Subscribers need the difference: a document
     that has already updated its own runtime does not want to be told to do it
     again, and without the distinction the only way to tell is a flag threaded
     around every call site. */
  function emit(changed, origin) {
    var snapshot = read();
    for (var i = 0; i < subs.length; i++) {
      try { subs[i](snapshot, changed, origin || "local"); } catch (e) {}
    }
  }

  /* One setter behind all six, so validation, persistence, and notification
     cannot be done for one dial and forgotten for the next. A write that does
     not change the value notifies nobody, which is what keeps a subscriber that
     re-renders on change from re-rendering on every keystroke that happens to
     re-assert the same surface. */
  function set(field, value) {
    var s = read();
    var next = clone(s);
    next[field] = value;
    next = normalise(next);
    if (next[field] === s[field]) return next[field];
    write(next);
    emit([field]);
    return next[field];
  }

  var STAGING = {
    KEY: KEY,
    DEFAULTS: clone(DEFAULTS),

    /* The whole snapshot, for a caller that wants to hydrate several dials at
       once without six reads of the same string. */
    get: function () { return read(); },

    getSurface: function () { return read().surface; },
    setSurface: function (v) { return set("surface", v); },

    getScenario: function () { return read().scenario; },
    setScenario: function (v) { return set("scenario", v); },

    getConnectivity: function () { return read().connectivity; },
    setConnectivity: function (v) { return set("connectivity", v); },

    getCapacity: function () { return read().capacity; },
    setCapacity: function (v) { return set("capacity", v); },

    getClockOffset: function () { return read().clockOffset; },
    setClockOffset: function (v) { return set("clockOffset", v); },

    getTheme: function () { return read().theme; },
    setTheme: function (v) { return set("theme", v); },

    /* Not a harness dial. The desktop sidebar's icon-only rail, shared by both
       documents so the chrome does not change shape when a reader crosses
       between them. */
    getNavCollapsed: function () { return read().navCollapsed; },
    setNavCollapsed: function (v) { return set("navCollapsed", v === true); },

    /* The staging notice, once per sitting. No subscribers and no emit: Nothing
       repaints when this changes, because the only reader is the one arrival
       that asked. */
    noticeSeen: function () {
      if (noticeSeen) return true;
      try { return window.sessionStorage.getItem(NOTICE_KEY) === "1"; } catch (e) { return false; }
    },
    markNoticeSeen: function () {
      noticeSeen = true;
      try { window.sessionStorage.setItem(NOTICE_KEY, "1"); } catch (e) {}
    },

    /* The harness owns the scenario list. Handing it over here lets a stored
       key be validated against the real table without this file keeping a copy
       of it that could fall behind. */
    registerScenarios: function (keys) {
      scenarioKeys = Array.isArray(keys) ? keys.slice() : null;
      mem = null;
    },

    /* Applying the theme is three lines and both builds need exactly the same
       three, so they live here once. What differs is only what null means, and
       that is the argument: the customer build passes "dark" because that is
       what its markup ships pinned to, the console passes "system" because that
       is what its settings screen ships selected. Neither default is written to
       storage, so a reader who has never touched a theme control still gets the
       build's own look on both sides. */
    applyTheme: function (fallback) {
      var t = read().theme || fallback || "system";
      var el = document.documentElement;
      if (t === "system") el.removeAttribute("data-theme");
      else el.setAttribute("data-theme", t);
      return t;
    },

    /* Reset all state. Clears the one key, which includes the theme: the
       harness offers this as the way back to a clean demo, and a reset that
       left the console painted in someone else's choice from twenty minutes ago
       would not be one. */
    reset: function () {
      mem = null;
      if (storageOk) { try { window.localStorage.removeItem(KEY); } catch (e) {} }
      /* The notice comes back with everything else. Reset all state is offered
         as the way to a clean demo, and a clean demo is one somebody has not
         been told about yet. */
      noticeSeen = false;
      try { window.sessionStorage.removeItem(NOTICE_KEY); } catch (e) {}
      mem = clone(DEFAULTS);
      emit(["surface", "scenario", "connectivity", "capacity", "clockOffset", "theme", "navCollapsed"]);
      return clone(DEFAULTS);
    },

    /* Subscribe to dial changes. Returns its own unsubscribe, so a caller never
       has to hold on to the function reference it passed in.

       The callback receives (state, changed, origin). Two sources feed it. Calls
       made in this document notify synchronously and arrive as "local". Calls
       made in ANOTHER document arrive as a storage event and as "remote", which
       is the only reason the customer app and an admin page open in two tabs, or
       the preview frame and the page around it, stay in step without either of
       them polling. A subscriber that has already applied its own change reads
       origin and ignores the echo. */
    subscribe: function (fn) {
      if (typeof fn !== "function") return function () {};
      subs.push(fn);
      return function () {
        var i = subs.indexOf(fn);
        if (i >= 0) subs.splice(i, 1);
      };
    }
  };

  /* Settling the theme has to happen before the first paint or it is a flash of
     the other one, and "before the first paint" means here, in the head, while
     this script is still executing. Rather than make every document remember to
     call applyTheme on the next line, each declares its own default on the
     script tag that loads this file:

       <script src="staging-state.js" data-default-theme="dark"></script>

     The customer build says dark because its markup ships pinned to it. The
     console says system because its settings screen ships with System selected.
     A document that declares nothing gets no theme applied at all, which is the
     right answer for anything that only wants to read the dials. */
  var tag = document.currentScript;
  var declared = tag && tag.getAttribute("data-default-theme");
  if (declared) STAGING.applyTheme(declared);

  window.addEventListener("storage", function (e) {
    if (e.key !== null && e.key !== KEY) return;
    mem = null;
    emit(["surface", "scenario", "connectivity", "capacity", "clockOffset", "theme", "navCollapsed"], "remote");
  });

  window.STAGING = STAGING;
})();
