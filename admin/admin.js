/* ============================================================
   THE FIT CLUB COURTS - ADMIN / STAFF CONSOLE
   Shared shell, loaded by every page in this folder.

   The chrome is built here rather than pasted into each page. There are more
   than twenty screens in this sandbox and the app bar, the drawer, and the tab
   bar are identical on all of them, so they live in one place: change a
   destination once and every screen follows. Each page declares what it is
   through data attributes on <body> and this file does the rest.

     data-title   The label in the centre of the app bar.
     data-nav     Which of the five tab bar items is current.
     data-back    Present if the left slot is a back arrow rather than the
                  hamburger. Its value is the href to go back to.

   Nothing here is a framework. It is plain DOM in one closure, because a
   prototype that needs a build step is a prototype nobody opens.
   ============================================================ */
(function(){
  "use strict";

  /* ---------- DEMO STATE ----------
     One source for the numbers that appear in more than one place, so the badge
     on the bell, the count in the drawer, and the figure on the dashboard
     cannot disagree with each other.

     THE CAST IS TWO PEOPLE.
     It used to be eight, spread across sixteen files, and eight fake names is
     six more than the console can demonstrate anything with. Rea is the signed
     in identity and maps to the Operations Manager surface; Joy is Front Desk,
     on duty, and carries the overdue task the scenarios need. Two is the
     smallest cast that still shows the permission boundary between those two
     roles, which is the distinction the whole product turns on. Everything the
     other six were holding is either theirs now or is Unassigned, which is
     better demo material than a name nobody will meet twice.

     The roster is here rather than only in the markup because the counts have to
     agree in five places. pendingTasks is derived from it rather than typed
     beside it, so a task moved between people cannot leave the bell, the drawer,
     and the dashboard saying three different numbers. */
  var STAFF = [
    { name:"Rea Salvador", role:"Club Manager", initials:"RS",
      shift:"6:00 AM to 3:00 PM", onDuty:true, pending:1, inProgress:1, overdue:0 },
    { name:"Joy Mendoza",  role:"Front Desk",  initials:"JM",
      shift:"6:00 AM to 2:00 PM", onDuty:true, pending:2, inProgress:0, overdue:1 }
  ];
  /* Work with no owner. Three jobs that used to belong to a Maintenance staffer
     and a second Front Desk staffer who are no longer in the cast. They are not
     quietly reassigned to the two who are left: an unfilled shift and unowned
     maintenance are the states this console exists to make visible, and a club
     this size genuinely has them. */
  var UNASSIGNED = { pending:2, inProgress:1 };

  var DATA = {
    /* From club.js, shared with the customer build. It used to be a literal
       here saying Kapitolyo, Pasig, which is a different city from the one the
       customer build sends people to. */
    club:   window.CLUB,
    admin:  STAFF[0],
    staff:  STAFF,
    unassigned: UNASSIGNED,
    unread: 4
  };
  /* 5 pending: Two of Joy's, one of Rea's, two with no owner. The overdue one is
     counted where it is, in progress, not here. */
  DATA.pendingTasks = STAFF.reduce(function(n, p){ return n + p.pending; }, 0) + UNASSIGNED.pending;
  /* Every open job on the board today, owned or not. It is the denominator the
     workload meters are a picture of, and it is derived here for the same
     reason pendingTasks is: a task moved from a person to Unassigned must not
     leave two bars claiming a share of a total that no longer exists. */
  DATA.openTasks = STAFF.reduce(function(n, p){ return n + p.pending + p.inProgress; }, 0) +
                   UNASSIGNED.pending + UNASSIGNED.inProgress;
  DATA.onDuty = STAFF.filter(function(p){ return p.onDuty; }).length;
  window.ADMIN = DATA;

  /* ---------- ICONS ----------
     One sprite, injected once per page. Stroked rather than filled, 24px grid,
     1.75 weight: the same drawing language as the customer app, which never
     uses a filled icon except inside a pressed tab pill. */
  var ICONS = {
    menu:      '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close:     '<path d="M6 6l12 12M18 6L6 18"/>',
    bell:      '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
    grid:      '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    calendar:  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    court:     '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M12 5v14M2.5 12h19M7 9.5h10v5H7z"/>',
    users:     '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16.5 5.6a3.2 3.2 0 0 1 0 4.8M17.5 14.2A6.5 6.5 0 0 1 21.5 20"/>',
    dots:      '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    chevR:     '<path d="M9 5l7 7-7 7"/>',
    chevL:     '<path d="M15 5l-7 7 7 7"/>',
    chevD:     '<path d="M5 9l7 7 7-7"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
    check:     '<path d="M4 12.5l5 5L20 6.5"/>',
    checkc:    '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.7 2.7L16 9.5"/>',
    alert:     '<path d="M12 3.5 1.8 20.5h20.4z"/><path d="M12 10v4"/><circle cx="12" cy="17.4" r="1"/>',
    info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1"/>',
    card:      '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19"/>',
    peso:      '<path d="M7 20V4h5.5a4 4 0 0 1 0 8H7"/><path d="M4.5 9.5h9M4.5 13h9"/>',
    chart:     '<path d="M3.5 20.5h17"/><rect x="5" y="11" width="3.5" height="7"/><rect x="10.2" y="6.5" width="3.5" height="11.5"/><rect x="15.5" y="14" width="3.5" height="4"/>',
    tag:       '<path d="M11 3H3v8l10 10 8-8L11 3z"/><circle cx="7.2" cy="7.2" r="1.3"/>',
    hours:     '<circle cx="12" cy="12" r="9"/><path d="M12 6.5V12l4 2.2"/>',
    activity:  '<path d="M2.5 12h4l2.5-7 5 14 2.5-7h5"/>',
    settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
    help:      '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 1 1 3.4 3.1c-.6.2-.9.7-.9 1.3v.5"/><circle cx="12" cy="17.2" r="1"/>',
    logout:    '<path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    building:  '<path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5V21"/><path d="M16 10h3a1 1 0 0 1 1 1v10M2.5 21h19M7.5 8h5M7.5 12h5M7.5 16h5"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    search:    '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    filter:    '<path d="M3.5 5.5h17l-6.5 7.5v6l-4 2v-8z"/>',
    edit:      '<path d="M15.5 4.5l4 4L8 20H4v-4z"/>',
    user:      '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    phone:     '<path d="M6 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.7 2 2 0 0 1 6 3.5z"/>',
    mail:      '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/>',
    message:   '<path d="M20.5 15.5a2 2 0 0 1-2 2H8l-4.5 3.5V5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    wrench:    '<path d="M15.5 3.5a5.5 5.5 0 0 0-6.4 7.2L3 16.8 6.2 20l6.1-6.1a5.5 5.5 0 0 0 7.2-6.4l-3.2 3.2-2.8-.7-.7-2.8z"/>',
    lock:      '<rect x="4.5" y="10" width="15" height="10.5" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    ban:       '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    list:      '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12M3.5 6.5h1M3.5 12h1M3.5 17.5h1"/>',
    tasks:     '<path d="M9.5 6.5h11M9.5 12h11M9.5 17.5h11"/><path d="M3.5 6.3l1.4 1.4 2.3-2.6M3.5 11.8l1.4 1.4 2.3-2.6"/><path d="M3.6 16.6h3.4"/>',
    play:      '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
    flag:      '<path d="M5 21V4h13l-2.5 4L18 12H5"/>',
    trash:     '<path d="M4.5 6.5h15M9 6.5V4.5h6v2M6.5 6.5l1 13.5h9l1-13.5"/>',
    arrowR:    '<path d="M4 12h15M13 6l6 6-6 6"/>',
    refresh:   '<path d="M20 11a8 8 0 1 0-.6 4"/><path d="M20 4.5V11h-6"/>',
    key:       '<circle cx="8" cy="14" r="4.5"/><path d="M11.4 11.2 20 3.5M16.5 7l2.5 2.5M14.2 9.2l2.2 2.2"/>',
    download:  '<path d="M12 3.5v11M7.5 10.5l4.5 4.5 4.5-4.5M4 20.5h16"/>',
    /* The staging flask, carried over from the customer build's sprite so the
       forced-state marker wears the same glyph on both sides of the boundary. It
       was the one icon the marker needed and the one this sprite did not have,
       which showed up as a hole in the band rather than as an error. */
    flask:     '<path d="M9 3h6M10 3v6L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7.4 15h9.2"/>'
  };

  function svg(name, cls){
    var body = ICONS[name] || "";
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
           'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  window.icon = svg;

  /* ---------- NAVIGATION MODEL ----------
     The destination list moved to console-nav.js one level up. It used to live
     here, which was right while the console was the only thing that had one; the
     staff shell in the customer build now draws the same sidebar, and two copies
     of a destination list is one place too many to remember to add a screen. The
     five tab bar items and the drawer's groups both come from there.

     Kept as locals under the old names so the rest of this file reads as it did.
     The drawer flattens the grouped model back into the single sequence it has
     always rendered, because a dialog on a phone has no room to be a two level
     structure and never pretended to. */
  var NAV = window.CONSOLE_NAV;
  var TABS = NAV.TABS;
  var DRAWER = NAV.GROUPS.reduce(function(list, g){
    list.push({ group: g.group });
    return list.concat(g.items);
  }, []);

  /* ---------- BUILD THE CHROME ---------- */
  function build(){
    var body = document.body;
    var title = body.getAttribute("data-title") || "Admin";
    var nav   = body.getAttribute("data-nav") || "";
    var back  = body.getAttribute("data-back");

    /* The app bar. The left slot is either the hamburger or a back arrow, never
       both: a screen that is one level down does not also need the drawer,
       which is always two taps away from wherever it lands. */
    var left = back
      ? '<a class="iconbtn iconbtn--bare" href="' + back + '" aria-label="Back">' + svg("chevL") + '</a>'
      : '<button class="iconbtn iconbtn--bare" type="button" id="menuBtn" aria-label="Open menu" aria-haspopup="dialog">' + svg("menu") + '</button>';

    var bellLabel = DATA.unread
      ? "Notifications, " + DATA.unread + " unread"
      : "Notifications, none unread";
    var bell = '<a class="iconbtn iconbtn--bare hasbadge" href="notifications.html" aria-label="' + bellLabel + '">' +
               svg("bell") + (DATA.unread ? '<span class="badge" aria-hidden="true"></span>' : "") + '</a>';

    var avatar = '<a class="iconbtn iconbtn--bare appbar__avatar" href="club-profile.html" aria-label="' +
                 DATA.admin.name + ', ' + DATA.admin.role + '">' +
                 '<span class="avatar">' + DATA.admin.initials + '</span></a>';

    var bar = document.createElement("header");
    bar.className = "appbar";
    bar.innerHTML =
      '<div class="appbar__in">' +
        '<div class="appbar__start">' + left + '</div>' +
        '<h1 class="appbar__title" id="barTitle">' + title + '</h1>' +
        '<div class="appbar__end">' + bell + avatar + '</div>' +
      '</div>';

    var shell = document.getElementById("shell");
    shell.insertBefore(bar, shell.firstChild);

    /* The tab bar, appended last so it is the final thing in the tab order
       before the page ends. */
    var tabs = document.createElement("nav");
    tabs.className = "tabbar";
    tabs.setAttribute("aria-label", "Main");
    tabs.innerHTML = '<div class="tabbar__in">' + TABS.map(function(t){
      var cur = (t.id === nav);
      var badge = (t.id === "more" && DATA.pendingTasks) ? '<span class="badge" aria-hidden="true"></span>' : "";
      return '<a href="' + t.href + '"' + (cur ? ' aria-current="page"' : "") + (badge ? ' class="hasbadge"' : "") + '>' +
             '<span class="tabpill">' + svg(t.icon) + '</span>' + badge +
             '<span>' + t.label + '</span></a>';
    }).join("") + '</div>';
    shell.appendChild(tabs);

    if (!back) buildDrawer(shell);
    buildSidebar(shell, nav);
    buildToast();
    buildLive();
    liftToast();
    paintWorkload();
    hydrateIcons(document);
    wire();
  }

  /* ---------- THE SIDEBAR ----------
     Built on every page and at every width, and hidden below 1024px by the
     stylesheet rather than by a media query in here. A JS breakpoint would have
     to be re-evaluated on resize, would race the first paint, and would leave the
     rail half built if a reader dragged a window across the threshold. display:
     none also takes it out of the tab order and out of the accessibility tree, so
     a phone never meets a navigation it cannot see.

     Unlike the drawer, this is built even on a screen that declares data-back.
     The drawer is skipped there because a screen one level down does not need a
     dialog it can reach in two taps; a sidebar is not a dialog, it is the frame,
     and a detail screen missing the frame would be the only page in the console
     with no way out but the browser.

     The three sections of the model are drawn in the order the console reads
     them: the five tab destinations first, because they are the same five the
     phone gets, then the groups. */
  function buildSidebar(shell, nav){
    if (!window.CONSOLE_NAV) return;
    var here = location.pathname.split("/").pop();

    var el = document.createElement("nav");
    el.className = "sidenav";
    el.id = "sidenav";
    el.setAttribute("aria-label", "Console");
    el.innerHTML = NAV.sidebar({
      icon: svg,
      prefix: "",
      counts: DATA,
      badgeNoun: { unread:"unread", pendingTasks:"pending tasks" },
      collapsed: !!(window.STAGING && STAGING.getNavCollapsed()),
      /* Role only, not role plus club. The drawer can afford both because its
         panel is 19rem of a phone screen with nothing beside it; the rail is
         narrower than that and the club name is the half that truncates, which
         leaves "Club Manager, The F..." saying less than "Club Manager" does. */
      head: { title: DATA.admin.name, sub: DATA.admin.role },
      /* The console's home is the dashboard, not the customer landing page. A
         reader who clicks a wordmark inside a back office expects the top of the
         back office; the way out to the other build is a named row in System and
         says so. */
      home: "dashboard.html",
      brandLabel: DATA.club.name + ", console home",
      primary: TABS.map(function(t){
        return { href:t.href, label:t.label, icon:t.icon, current:(t.id === nav),
                 badge:(t.id === "more" ? "pendingTasks" : null), quiet:true };
      }),
      groups: NAV.GROUPS,
      note: "Customer Build, in the System group, is the way back to the other half of this prototype. It carries the theme and the armed scenario across.",
      isCurrent: function(item){ return item.href === here; }
    });

    /* First child, so the reading order and the tab order both start with the
       navigation rather than reaching it after the whole page. */
    shell.insertBefore(el, shell.firstChild);
  }

  /* Pages ask for an icon by name and get the drawing here, so no page carries
     a path definition and the whole console changes shape from one object. */
  function hydrateIcons(root){
    Array.prototype.forEach.call(root.querySelectorAll("[data-icon]"), function(el){
      var name = el.getAttribute("data-icon");
      var cls = el.getAttribute("data-icon-class") || "";
      el.outerHTML = svg(name, cls);
    });
  }

  function buildDrawer(shell){
    var d = document.createElement("dialog");
    d.className = "drawer";
    d.id = "drawer";
    d.setAttribute("aria-label", "Admin menu");

    var rows = DRAWER.map(function(item){
      if (item.group) return '<div class="drawer__group"><span>' + item.group + '</span></div>';
      var here = location.pathname.split("/").pop() === item.href;
      var count = item.badge && DATA[item.badge]
        ? '<span class="countpill" aria-hidden="true">' + DATA[item.badge] + '</span>' : "";
      var label = item.label + (count ? ", " + DATA[item.badge] + " unread" : "");
      return '<a class="navrow' + (item.danger ? " navrow--danger" : "") + '" href="' + item.href + '"' +
             (here ? ' aria-current="page"' : "") + (count ? ' aria-label="' + label + '"' : "") + '>' +
             svg(item.icon) + '<span>' + item.label + '</span>' + count +
             (item.danger ? "" : svg("chevR", "row__chev")) + '</a>';
    }).join("");

    d.innerHTML =
      '<div class="drawer__panel">' +
        /* The brand takes the top of the panel and the close button sits beside
           it, which is the same two-row shape the desktop rail uses: mark first,
           then who is signed in. It is also where the close button already was,
           so nothing about reaching it changed.

           The mark is a picture of the club's name, so it is painted on an empty
           span and named in a visually hidden sibling rather than given an alt.
           The row below names the club again in full, and an alt here would have
           a screen reader read it twice before reaching a single destination. */
        '<div class="drawer__brand">' +
          '<a class="drawer__mark" href="dashboard.html">' +
            '<span class="drawer__markimg" aria-hidden="true"></span>' +
            '<span class="vh">' + DATA.club.name + ', console home</span>' +
          '</a>' +
          '<button class="iconbtn iconbtn--bare" type="button" data-close aria-label="Close menu">' + svg("close") + '</button>' +
        '</div>' +
        '<div class="drawer__head">' +
          '<span class="avatar avatar--lg" aria-hidden="true">' + DATA.admin.initials + '</span>' +
          '<span class="drawer__id"><b>' + DATA.admin.name + '</b><span>' + DATA.admin.role + ' &middot; ' + DATA.club.name + '</span></span>' +
        '</div>' +
        '<div class="drawer__body">' + rows + '</div>' +
      '</div>';
    shell.appendChild(d);
  }

  /* ---------- TOAST ----------
     One node, built once by build() and reused for every message. It replaces
     the two alert() calls this file used to make.

     It hangs off document.body rather than off #shell, and that is not a
     stylistic preference: #shell is overflow-x:clip, which establishes a
     containing block, and a position:fixed toast inside it would be clipped by
     it at exactly the moment it slides in from the bottom edge.

     A second message replaces the first rather than stacking. A stack is a
     queue the reader did not ask to manage, and replacing the text of one live
     region is also what makes a screen reader announce once per message instead
     of once per node. */
  var toastEl = null, toastMsg = null, toastTimer = null, toastPaused = false, toastReturn = null;

  /* Five seconds, doubled when the reader has asked for less motion. The
     entrance is what tells a sighted reader something arrived; with the slide
     gone there is nothing to catch the eye, so the same five seconds is less
     time in practice than it looks. Hovering or focusing anything inside stops
     the clock outright, so neither number is a deadline. */
  var TOAST_MS = 5000;

  function toastStop(){ if (toastTimer){ clearTimeout(toastTimer); toastTimer = null; } }
  function toastStart(){
    toastStop();
    if (toastPaused) return;
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
    toastTimer = setTimeout(toastHide, reduced ? TOAST_MS * 2 : TOAST_MS);
  }
  function toastHide(){
    toastStop();
    if (!toastEl) return;
    /* Focus goes back where it was, but only if the reader moved it in here to
       press Dismiss. The toast is about to become visibility:hidden, and a
       focused element inside a hidden subtree drops focus to <body>, which
       loses a keyboard reader their place in the page. When focus was never in
       the toast, nothing is touched: A message timing out under someone typing
       must not move their cursor. */
    var returning = toastEl.contains(document.activeElement);
    toastEl.classList.remove("toast--on");
    if (returning && toastReturn && toastReturn.isConnected) toastReturn.focus();
    toastReturn = null;
    /* The text is cleared only after the fade, so the message is still readable
       while it leaves and the live region is not re-announced as empty. */
    setTimeout(function(){ if (!toastEl.classList.contains("toast--on")) toastMsg.textContent = ""; }, 260);
  }

  function toast(msg){
    if (!toastEl) return;
    toastStop();
    toastPaused = false;
    /* Captured before the toast appears, and not overwritten while it is still
       up, so a stub pressed twice still returns to the button that was pressed
       rather than to the toast itself. */
    if (!toastEl.contains(document.activeElement)) toastReturn = document.activeElement;
    toastEl.classList.add("toast--on");
    /* Visible first, text second. A live region has to be in the accessibility
       tree at the moment its content changes, and visibility:hidden takes it
       out of that tree; setting both in one frame is the reliable way to lose
       the announcement on some readers. */
    requestAnimationFrame(function(){
      toastMsg.textContent = msg;
      toastStart();
    });
  }

  /* The count announcement goes here rather than through the visible toast, and
     the split is deliberate. A filter result is already on screen in the
     re-derived heading, so popping a plate over the list to repeat it would be
     stating the same fact twice, in the reader's way, on every chip press. The
     toast is for messages with nowhere else to live. index.html draws the same
     line between its screen-reader-only announce() and its visible UI, and this
     is the console's half of it. */
  var liveEl = null;
  function announce(msg){
    if (!liveEl) return;
    /* Cleared first, so pressing a chip that lands on the same count as the
       last one still counts as a change and is still read out. */
    liveEl.textContent = "";
    requestAnimationFrame(function(){ liveEl.textContent = msg; });
  }
  function buildLive(){
    var l = document.createElement("p");
    l.className = "vh";
    l.setAttribute("role", "status");
    l.setAttribute("aria-live", "polite");
    document.body.appendChild(l);
    liveEl = l;
  }

  /* The dock is the one action a screen exists to perform, pinned to the foot.
     A message that covers it for five seconds is worse than the alert() this
     replaced, so the toast is lifted by the dock's measured height rather than
     by a number copied from the stylesheet: three screens have a dock and their
     docks are not the same height. */
  function liftToast(){
    var dock = document.querySelector(".dock");
    document.documentElement.style.setProperty("--toast-lift",
      (dock ? Math.round(dock.getBoundingClientRect().height) : 0) + "px");
  }

  /* ---------- WORKLOAD METERS ----------
     The two bars on the Staff screen used to be 85% and 45%, named "heavy" and
     "moderate", over two people carrying two open tasks each. Nothing in the
     roster produced either number, so a sighted reader got a pink bar and a
     cream bar and no way to check them, and the accessible name said a third
     thing again.

     What the roster does hold is counts, so counts are what the meter shows: a
     person's open jobs as a share of every open job on the board today. That
     needs no capacity figure, which is the one number this console would have
     had to invent to keep the old reading, and the console does not get to
     invent numbers in the middle of a sweep about not inventing numbers.

     The bar is one colour now. It used to go crit for Joy, which was the meter
     trying to say "overdue" as well as "loaded"; her row already carries a
     1 Overdue pill two lines above, and one fact stated twice in two idioms is
     how the pair got out of step in the first place. */
  function paintWorkload(){
    var meters = document.querySelectorAll("[data-workload]");
    if (!meters.length) return;
    var total = DATA.openTasks || 0;
    Array.prototype.forEach.call(meters, function(m){
      var who = null;
      STAFF.forEach(function(p){ if (p.initials === m.getAttribute("data-workload")) who = p; });
      if (!who) return;
      var mine = who.pending + who.inProgress;
      var phrase = "Share of today's tasks, " + mine + " of " + total;
      m.querySelector("[data-workload-num]").textContent = mine + " of " + total;
      m.querySelector(".meter__track").setAttribute("aria-label", phrase);
      m.querySelector(".meter__fill").style.width = (total ? Math.round(mine / total * 100) : 0) + "%";
    });
  }

  function buildToast(){
    var t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    t.innerHTML =
      '<p class="toast__msg"></p>' +
      '<button class="toast__x" type="button" aria-label="Dismiss message">' + svg("close") + "</button>";
    document.body.appendChild(t);
    toastEl = t;
    toastMsg = t.querySelector(".toast__msg");

    t.querySelector(".toast__x").addEventListener("click", toastHide);

    /* Pointer and keyboard get the same pause, because they are the same
       request: someone is reading it. focusin / focusout stand in for
       :focus-within, which CSS can express and a timer cannot. */
    t.addEventListener("mouseenter", function(){ toastPaused = true; toastStop(); });
    t.addEventListener("mouseleave", function(){ toastPaused = false; if (t.classList.contains("toast--on")) toastStart(); });
    t.addEventListener("focusin",  function(){ toastPaused = true; toastStop(); });
    t.addEventListener("focusout", function(){ toastPaused = false; if (t.classList.contains("toast--on")) toastStart(); });
    return t;
  }

  /* ---------- ROW FILTERS ----------
     Two querySelectorAll loops over static rows, which is the right size for
     this. There is no list model behind these screens and there does not need
     to be one: the rows are in the document, they already state their status in
     words, and the attributes added beside those words say the same thing in a
     form a loop can read. The attribute and the pill agree by construction,
     because each was written from the other.

     A control declares what it selects in its own markup, as data-match, so a
     reader can see a chip's definition beside the chip instead of hunting for
     it in here. The grammar is one pair, with an optional alternation:

       data-match="kind=booking"          the row's data-kind is booking
       data-match="pay=unpaid|overdue"    the row's data-pay is either of those

     Every pressed control has to match. Two chips from different facets narrow
     each other, which is what a reader pressing both means; two that contradict
     select nothing, which is what the empty state is for. Rejected alternative:
     Or within a group and and across groups, which reads better on paper and
     then cannot express "unpaid and confirmed" without a second grammar.

     Rows are found by data-kind rather than by class, so a row the scenario
     harness injects, which carries data-scn-row and no data-kind, is left alone
     and is neither hidden nor counted. The harness speaking is not the club's
     list, and a filter should not be able to hide the marker that explains why
     the screen looks the way it does. */
  function matches(row, spec){
    var eq = spec.indexOf("=");
    if (eq < 0) return true;
    var val = row.getAttribute("data-" + spec.slice(0, eq));
    var want = spec.slice(eq + 1).split("|");
    for (var i = 0; i < want.length; i++) if (val === want[i]) return true;
    return false;
  }

  function filterSet(name){
    var set = document.querySelector('[data-rowset="' + name + '"]');
    if (!set) return null;
    var rows = set.querySelectorAll("[data-kind]");
    var controls = document.querySelectorAll('[data-filters="' + name + '"] [aria-pressed="true"][data-match]');
    var specs = [], labels = [], noun = null;
    Array.prototype.forEach.call(controls, function(c){
      specs.push(c.getAttribute("data-match"));
      /* A mode names the list; a filter narrows it. The pressed option of a
         mode group therefore supplies the heading's noun and stays out of the
         "filtered by" phrase, because it is not a filter applied to bookings,
         it is the answer to what these rows are. */
      if (c.closest("[data-mode]")){ noun = c.getAttribute("data-noun") || noun; return; }
      /* The chip's own words, so the announcement cannot drift from the label
         the sighted reader pressed. The count pill inside the segmented control
         is stripped, because "Bookings 5" read aloud as a filter name is the
         count said twice in one sentence. */
      var t = c.cloneNode(true);
      Array.prototype.forEach.call(t.querySelectorAll(".countpill"), function(x){ x.remove(); });
      labels.push((t.textContent || "").replace(/\s+/g, " ").trim());
    });

    var shown = 0;
    Array.prototype.forEach.call(rows, function(r){
      var ok = true;
      for (var i = 0; i < specs.length && ok; i++) ok = matches(r, specs[i]);
      /* The hidden attribute, not a class. A class would leave the row in the
         accessibility tree, which means a screen reader still walks rows the
         sighted reader cannot see and the count above it becomes the only
         honest thing on the screen. */
      r.hidden = !ok;
      if (ok) shown++;
    });

    /* Every figure on the screen comes out of this one pass, so the heading,
       the type switch, and the day rail cannot disagree with each other or with
       what is on screen. The count pills count the whole day rather than the
       filtered set, because they label what pressing that segment would show. */
    var head = set.parentNode.querySelector("[data-listcount]");
    if (!noun && head) noun = head.getAttribute("data-listcount");
    if (head) head.textContent = shown + " " + noun + (shown === 1 ? "" : "s");
    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function(el){
      var n = 0;
      Array.prototype.forEach.call(rows, function(r){ if (matches(r, el.getAttribute("data-count"))) n++; });
      el.textContent = n;
    });
    /* The day rail's figure for the day on screen, and the sentence a screen
       reader gets for that button, out of the same count. The other six days
       keep their sample figures, because there is no list behind them. */
    var day = document.querySelector('[data-daycount="' + name + '"]');
    if (day){
      day.textContent = rows.length;
      var btn = day.closest("[data-daylabel]");
      if (btn) btn.setAttribute("aria-label", btn.getAttribute("data-daylabel") + ", " + rows.length + " on the schedule");
    }

    var empty = document.querySelector('[data-empty="' + name + '"]');
    if (empty) empty.hidden = shown > 0;

    return { shown: shown, labels: labels, noun: noun || "row" };
  }

  /* Announced rather than left silent. A filter that reorders the page under a
     screen reader without saying so has not finished, and the sighted reader
     gets the same fact in the heading at the same moment. */
  function filterAndSay(name){
    var r = filterSet(name);
    if (!r) return;
    /* The noun is not lowercased on the way into the announcement. Open Play is
       a proper noun in this product and "1 open play session" is the one place
       in the build that would have said otherwise. */
    var msg = r.shown + " " + r.noun + (r.shown === 1 ? "" : "s");
    announce(r.labels.length ? msg + ", filtered by " + r.labels.join(" and ") + "." : msg + ", no filters.");
  }

  /* ---------- BEHAVIOUR ---------- */
  function wire(){
    var drawer = document.getElementById("drawer");
    var menuBtn = document.getElementById("menuBtn");

    if (window.CONSOLE_NAV) CONSOLE_NAV.wireSidebar(document);

    /* The drawer and the sidebar are the same navigation at two widths, and they
       must never both be present. Below 1024 the sidebar is display:none and the
       drawer is the answer; from 1024 up the sidebar is the frame and the
       hamburger that opens the drawer is hidden. The one gap either stylesheet
       leaves is a reader who opens the drawer on a narrow window and then widens
       it, which would leave a modal dialog sitting over a navigation that already
       says the same thing. Closing it on the way past is the whole fix. */
    if (window.matchMedia){
      var wide = matchMedia("(min-width:1024px)");
      var onWide = function(e){
        if (e.matches && drawer && drawer.open) drawer.close();
      };
      if (wide.addEventListener) wide.addEventListener("change", onWide);
      else if (wide.addListener) wide.addListener(onWide);
    }

    if (menuBtn && drawer){
      menuBtn.addEventListener("click", function(){ drawer.showModal(); });
      /* A click on the backdrop is a click on the dialog element itself, since
         the panel does not cover the whole box. That is the whole test. */
      drawer.addEventListener("click", function(e){
        if (e.target === drawer) drawer.close();
      });
      drawer.addEventListener("close", function(){ menuBtn.focus(); });
    }
    document.addEventListener("click", function(e){
      var c = e.target.closest("[data-close]");
      if (c){ var dlg = c.closest("dialog"); if (dlg) dlg.close(); }
      var o = e.target.closest("[data-open]");
      if (o){
        var t = document.getElementById(o.getAttribute("data-open"));
        if (t && t.showModal) { t.showModal(); }
      }
      var s = e.target.closest("dialog.sheet");
      if (s && e.target === s) s.close();
    });

    /* Log Out is the one drawer row that is not a destination. In the sandbox it
       says what it would do rather than pretending to do it. */
    document.addEventListener("click", function(e){
      var a = e.target.closest('a[href="#logout"]');
      if (!a) return;
      e.preventDefault();
      toast("Sandbox: This would sign " + DATA.admin.name + " out and return to the staff login.");
    });

    /* Pressed state for anything that is a toggle in a rail: filters, segmented
       controls, and the day buttons.

       This used to say that in the sandbox it only paints, and that was true and
       was the whole of finding 2. A chip painted itself pressed over a list it
       did not touch, which a reviewer cannot tell apart from a filter that is
       broken. Where the group names a row set through data-filters, the press
       now re-queries that set and every count on the screen comes with it. The
       day rail still only paints, because there is no second day behind it, and
       the sandbox note on each screen says which is which. */
    document.addEventListener("click", function(e){
      var b = e.target.closest('[data-toggle="single"] > [aria-pressed]');
      if (!b) return;
      var group = b.parentNode;
      Array.prototype.forEach.call(group.querySelectorAll("[aria-pressed]"), function(x){
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      var set = group.getAttribute("data-filters");
      if (set) filterAndSay(set);
    });
    document.addEventListener("click", function(e){
      var b = e.target.closest('[data-toggle="multi"] > [aria-pressed]');
      if (!b) return;
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      var set = b.parentNode.getAttribute("data-filters");
      if (set) filterAndSay(set);
    });

    /* The way out of a combination that selects nothing. It clears the chips a
       reader pressed and leaves a single-select group on its first option,
       because a single-select group has no all-off state to return to. */
    document.addEventListener("click", function(e){
      var c = e.target.closest("[data-clearfilters]");
      if (!c) return;
      var name = c.getAttribute("data-clearfilters");
      Array.prototype.forEach.call(document.querySelectorAll('[data-filters="' + name + '"]'), function(g){
        var opts = g.querySelectorAll("[aria-pressed]");
        var single = g.getAttribute("data-toggle") === "single";
        Array.prototype.forEach.call(opts, function(x, i){
          x.setAttribute("aria-pressed", single && i === 0 ? "true" : "false");
        });
      });
      filterAndSay(name);
    });

    /* Switches. A real control with a real role, not a styled checkbox that a
       screen reader has to guess at. */
    document.addEventListener("click", function(e){
      var s = e.target.closest(".switch");
      if (!s) return;
      s.setAttribute("aria-checked", s.getAttribute("aria-checked") === "true" ? "false" : "true");
    });

    /* Every other control in the sandbox is a stub. Rather than let a staff
       member tap Cancel and watch nothing happen, the button says what it would
       have done. One handler covers all of them. */
    document.addEventListener("click", function(e){
      var b = e.target.closest("[data-stub]");
      if (!b) return;
      e.preventDefault();
      var dlg = b.closest("dialog");
      if (dlg) dlg.close();
      toast("Sandbox: " + b.getAttribute("data-stub"));
    });
  }

  /* ---------- SCROLL CUE ----------
     No track, no gutter, no permanent bar: a short translucent cue that appears
     while something is moving and fades once it stops. Capture phase, because a
     scroll event does not bubble but does propagate down, so one listener on the
     document sees every scroller including ones that do not exist yet. When the
     thing that scrolled is inside an open dialog the cue moves into that dialog,
     because a modal is painted in the top layer and a cue parented to the body
     would sit behind the backdrop.
     Fine pointers only. A touch platform already does all of this natively. */
  function scrollcue(){
    if (!window.matchMedia || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    function make(cls){
      var e = document.createElement("div");
      e.className = cls; e.setAttribute("aria-hidden","true");
      document.body.appendChild(e); return e;
    }
    var V = make("scrollcue scrollcue--v");
    var H = make("scrollcue scrollcue--h");
    var MIN = 26, GAP = 3;
    var hideT = null, queued = false, pending = null;

    function rest(){
      V.removeAttribute("data-on"); H.removeAttribute("data-on");
      if (V.parentNode !== document.body) document.body.appendChild(V);
      if (H.parentNode !== document.body) document.body.appendChild(H);
    }
    function arm(){ clearTimeout(hideT); hideT = setTimeout(rest, 620); }

    function paint(){
      queued = false;
      var t = pending; pending = null;
      if (!t) return;
      var doc = (t === document || t === document.documentElement || t === document.body);
      var el = doc ? document.documentElement : t;
      if (!doc && el.nodeType !== 1) return;

      var top, left, vw, vh;
      if (doc){
        top = 0; left = 0;
        vw = document.documentElement.clientWidth;
        vh = document.documentElement.clientHeight;
      } else {
        var r = el.getBoundingClientRect();
        top = r.top + el.clientTop; left = r.left + el.clientLeft;
        vw = el.clientWidth; vh = el.clientHeight;
      }
      var host = (!doc && el.closest && el.closest("dialog[open]")) || document.body;
      var sh = el.scrollHeight, sw = el.scrollWidth;
      var st = doc ? (window.scrollY || el.scrollTop) : el.scrollTop;
      var sl = doc ? (window.scrollX || el.scrollLeft) : el.scrollLeft;

      if (sh > vh + 1 && vh > MIN * 2){
        var len = Math.max(MIN, Math.round(vh * vh / sh));
        V.style.top = Math.round(top + (st / (sh - vh)) * (vh - len)) + "px";
        V.style.height = len + "px";
        V.style.left = Math.round(left + vw - GAP - 6) + "px";
        if (V.parentNode !== host) host.appendChild(V);
        V.setAttribute("data-on","1");
      }
      if (sw > vw + 1 && vw > MIN * 2){
        var lenH = Math.max(MIN, Math.round(vw * vw / sw));
        H.style.left = Math.round(left + (sl / (sw - vw)) * (vw - lenH)) + "px";
        H.style.width = lenH + "px";
        H.style.top = Math.round(top + vh - GAP - 6) + "px";
        if (H.parentNode !== host) host.appendChild(H);
        H.setAttribute("data-on","1");
      }
      arm();
    }

    document.addEventListener("scroll", function(ev){
      pending = ev.target;
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    }, true);
    window.addEventListener("resize", rest, { passive:true });
  }

  /* ---------- THE STAGING BRIDGE ----------
     staging-state.js is loaded in the head of every page in this folder, ahead
     of the stylesheet, because it settles the theme before the first paint. By
     the time this file runs the theme is already correct; what is left is
     keeping it correct while the page is open.

     This console is a folder of static documents, so most of what the bridge
     carries is read once at load and never changes underneath the reader. Theme
     is the exception: it can be flipped in the customer build, in a second tab,
     or in the frame around a preview, and a console still painted in the other
     one is a bug the reader can see. So the chrome subscribes to exactly that.

     Defensive about STAGING being absent rather than assuming it. A page opened
     straight off the filesystem, with no server and no sibling script, should
     still draw its chrome; the dials are a convenience on top of a console that
     has to work without them. */
  function bridge(){
    if (!window.STAGING) return;
    STAGING.subscribe(function(state, changed){
      if (changed.indexOf("theme") >= 0) STAGING.applyTheme("system");
      if (changed.indexOf("scenario") >= 0) applyScenario();
    });
  }

  /* ---------- SCENARIO HYDRATION ----------
     The harness in the customer build arms a scenario; this console draws its own
     sample for it. What crosses is a key, never an order: see staging-state.js
     for why. What each scenario means here is data on the scenario itself, in
     scenarios.js, so the console does not carry a second opinion about what
     "Amount mismatch" looks like.

     Light on purpose. These are static screens and they stay static screens; the
     hydration does three things and no more. It sets the text of a handful of
     marked spans, it injects marked rows into one list per screen, and it puts a
     hatched marker under the app bar saying which state is forced. There is no
     template system here and there should not be: twenty-six screens of sample
     markup is what makes this console reviewable, and turning it into a renderer
     would trade that for a data model nobody asked for.

     THE HONEST PART.
     A scenario that means nothing on the screen being viewed says so. It does
     not leave the sample data standing as though it were the answer, and it does
     not quietly render nothing. "This scenario has no consequence on this screen"
     is a true statement about the product and is more useful to a reviewer than
     silence, which is indistinguishable from a bug.

     Re-appliable. Originals are stashed on first write so a scenario changed in
     another tab can be applied over a clean slate rather than over the last
     one. */
  var scnMark = null;

  function clearScenario(){
    if (scnMark && scnMark.parentNode) scnMark.parentNode.removeChild(scnMark);
    scnMark = null;
    Array.prototype.forEach.call(document.querySelectorAll("[data-scn-row]"), function(el){
      el.parentNode.removeChild(el);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-scn][data-scn-was]"), function(el){
      el.textContent = el.getAttribute("data-scn-was");
      el.removeAttribute("data-scn-was");
    });
  }

  function applyScenario(){
    clearScenario();
    if (!window.STAGING || !window.SCENARIO_BY_KEY) return;

    var key = STAGING.getScenario();
    if (!key) return;
    var scn = SCENARIO_BY_KEY[key];
    if (!scn) return;
    /* The happy path is not a forced state, so it wears no marker on either side
       of the boundary. Anything else does, even where the marker's only content
       is that the scenario means nothing here. */
    if (scn.natural) return;

    /* The filename is the page identity. data-nav cannot be: Settings and Tasks
       both declare data-nav="more", and a scenario has different things to say
       about each. */
    var page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
    var admin = scn.admin || {};
    var here = (admin.pages || {})[page];

    var says = here && here.says
      ? here.says
      : "No consequence on this screen. The sample data below is unchanged and still true.";
    var line = admin.headline ? admin.headline + " " + says : says;

    var mark = document.createElement("p");
    mark.className = "injected";
    mark.innerHTML = svg("flask") +
      "<span><b>" + scn.label + ".</b> " + line + "</span>";
    /* First child of main, not a sibling between the app bar and it. The desktop
       layout pins the app bar to row 1 and main to row 2 of a two row grid, so a
       third element between them would land on top of one of them. Inside main
       it rides the content column and pulls itself out to the gutters, which is
       how the customer build's own marker sits under its app bar. */
    var main = document.getElementById("main");
    main.insertBefore(mark, main.firstChild);
    scnMark = mark;

    /* A second marker for the screens where the whole page is stale rather than
       one row of it. Only two scenarios carry one, and both are about the
       availability service rather than about a booking. */
    if (admin.banner && here){
      var band = document.createElement("p");
      band.className = "injected injected--band";
      band.innerHTML = svg("alert") + "<span>" + admin.banner + "</span>";
      main.insertBefore(band, mark.nextSibling);
      band.setAttribute("data-scn-row", "");
    }

    if (!here) return;

    if (here.set){
      Object.keys(here.set).forEach(function(id){
        var el = document.querySelector('[data-scn="' + id + '"]');
        if (!el) return;
        el.setAttribute("data-scn-was", el.textContent);
        el.textContent = here.set[id];
      });
    }

    if (here.inject){
      var slot = document.querySelector('[data-scn-slot="' + here.inject.slot + '"]');
      if (slot){
        var wrap = document.createElement("div");
        wrap.innerHTML = here.inject.html;
        var node = wrap.firstElementChild;
        if (node){
          slot.insertBefore(node, slot.firstChild);
          hydrateIcons(node);
        }
      }
    }
  }

  /* Filters run once on load, after the scenario has had its chance to inject.
     Nothing on these screens ships with a typed count: the headings, the type
     switch, and the day rail all start at zero in the markup and are filled
     from the rows here, so a row added or removed by hand cannot leave a
     figure behind that used to be true. */
  function start(){
    build(); bridge(); applyScenario(); scrollcue();
    Array.prototype.forEach.call(document.querySelectorAll("[data-rowset]"), function(set){
      filterSet(set.getAttribute("data-rowset"));
    });
  }
  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
