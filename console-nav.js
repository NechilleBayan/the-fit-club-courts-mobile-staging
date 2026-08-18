/* ============================================================
   THE FIT CLUB COURTS - CONSOLE NAVIGATION MODEL
   Loaded by every page of the admin console and by the customer build, which
   needs it for the staff shell.

   ONE NAV MODEL, TWO RENDERINGS.
   The destinations used to live in admin.js as TABS and DRAWER, which was right
   while the console was the only thing that had them. It is not any more: the
   staff shell in index.html now carries the same sidebar at desktop width, and a
   second copy of the destination list is a second place to add a screen and
   therefore a place to forget to. The list lives here; admin.js and index.html
   render it.

   The two renderings are the bottom tab bar and the sidebar, not the two
   documents. Below 1024px the console draws five tabs and a drawer dialog, from
   this model. From 1024px up both documents draw a sidebar, from this model. The
   drawer stops being necessary at that width because everything it held is
   already on screen.

   WHAT IS NOT SHARED, AND WHY.
   The PRIMARY section differs between the two documents on purpose. The console's
   primary section is TABS: Dashboard, Bookings, Courts, Staff, More. The staff
   shell's primary section is its own five shift destinations, which live in
   index.html because they are hash routes into that document's router and mean
   nothing here. What both documents share is GROUPS, the secondary and system
   areas, which are real files in admin/ and are reachable from either side.

   Nothing here draws an icon. Each document passes its own icon function in,
   because the console keeps its glyphs as path strings in admin.js and the
   customer build keeps its as <symbol> elements referenced by <use>. Reconciling
   those two sprites is a separate question from sharing a destination list, and
   conflating them would have held this up behind it.
   ============================================================ */
(function () {
  "use strict";

  /* The bottom bar is capped at five and this array is the enforcement: there is
     nowhere to put a sixth. Anything that does not earn a permanent slot lives
     in More or in the groups below. */
  var TABS = [
    { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "grid" },
    { id: "bookings",  label: "Bookings",  href: "bookings.html",  icon: "calendar" },
    { id: "courts",    label: "Courts",    href: "courts.html",    icon: "court" },
    { id: "staff",     label: "Staff",     href: "staff.html",     icon: "users" },
    { id: "more",      label: "More",      href: "more.html",      icon: "dots" }
  ];

  /* The secondary and system areas. None of the five tab bar destinations is
     repeated here: "Staff Management" is the roles, accounts, and pay area, which
     is a different job from the Staff tab's question of who is on shift right
     now, and it has its own screen.

     ops:true marks a group the Operations Manager sees and Front Desk does not.
     It is honoured where a surface is known, which today is the staff shell in
     the customer build; the console itself is signed in as the Club Manager and
     shows everything. As everywhere else in this prototype, hiding a row is not
     the security boundary, and the sidebar says so where it trims one. */
  var GROUPS = [
    { group: "Club", items: [
      { label: "Club Profile",        href: "club-profile.html", icon: "building" },
      { label: "Staff Management",    href: "staff-manage.html", icon: "key" },
      { label: "Players / Customers", href: "players.html",      icon: "user" }
    ] },
    { group: "Money", ops: true, items: [
      { label: "Payments",            href: "payments.html",     icon: "card" },
      { label: "Reports & Analytics", href: "reports.html",      icon: "chart" },
      { label: "Rates & Promotions",  href: "rates.html",        icon: "tag" }
    ] },
    { group: "System", items: [
      { label: "Operating Hours", href: "hours.html",         icon: "hours" },
      { label: "Notifications",   href: "notifications.html", icon: "bell", badge: "unread" },
      { label: "Activity Log",    href: "activity.html",      icon: "activity" },
      { label: "Settings",        href: "settings.html",      icon: "settings" },
      { label: "Help / Support",  href: "help.html",          icon: "help" },
      /* The way back to the customer build. It used to be a button on the
         console's contact sheet, which was the only page that had one and which
         no longer exists; without a home here, the console would be a folder you
         can enter and not leave except through the address bar. absolute keeps
         the prefix off it, since it is already relative to admin/, and
         consoleOnly keeps it out of the staff shell's rail, where a link to the
         document you are already reading would be furniture. */
      { label: "Customer Build",  href: "../index.html",      icon: "arrowR",
        absolute: true, consoleOnly: true }
    ] },
    { group: "Session", items: [
      { label: "Log Out", href: "#logout", icon: "logout", danger: true }
    ] }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- THE SIDEBAR ----------
     Returns markup rather than nodes, because both callers already build their
     chrome by assigning innerHTML and handing one of them a DocumentFragment
     would make this file the odd one out.

     opts.icon        function(name) -> an <svg> string, the caller's own sprite
     opts.prefix      path prepended to every group href ("" or "admin/")
     opts.primary     [{ href, label, icon, current, badge }] the top section
     opts.groups      the GROUPS subset this surface may see
     opts.counts      { unread: 4 } resolves a row's badge
     opts.badgeNoun   { unread: "unread" } names it for a screen reader
     opts.head        { title, sub } the identity block at the top
     opts.collapsed   boolean, the persisted rail state
     opts.note        a sentence under the list, or nothing

     Every row keeps its label in the DOM at both states. Collapsing clips the
     text to zero width rather than removing it, so the rail still has an
     accessible name for every destination and a screen reader user never meets a
     row that announces as a bare link. */
  function sidebar(opts) {
    var icon = opts.icon;
    var prefix = opts.prefix || "";
    var counts = opts.counts || {};

    function row(item, href, current) {
      var n = item.badge ? counts[item.badge] : 0;
      /* Red is the only colour the console spends, and it is spent on money and
         on closed courts. Four unread notifications earn it; five tasks sitting
         in a queue do not, so a row can ask for the quiet pill instead. */
      var count = n ? '<span class="countpill' + (item.quiet ? " countpill--quiet" : "") +
                      '" aria-hidden="true">' + n + "</span>" : "";
      /* The badge is decorative, so the number is spelled into the accessible
         name instead of left as an unannounced dot. The noun comes from the
         caller: the same pill counts unread notifications in one row and pending
         tasks in another, and "4 unread tasks" would be a sentence neither screen
         means. */
      var noun = (opts.badgeNoun && opts.badgeNoun[item.badge]) || "";
      var aria = count ? ' aria-label="' + esc(item.label + ", " + n + (noun ? " " + noun : "")) + '"' : "";
      return '<li>' +
        '<a class="sidenav__row' + (item.danger ? " sidenav__row--danger" : "") + '" href="' + esc(href) + '"' +
        (current ? ' aria-current="page"' : "") + aria + ">" +
        icon(item.icon) +
        '<span class="sidenav__label">' + esc(item.label) + "</span>" + count +
        "</a></li>";
    }

    var html = '<div class="sidenav__in">';

    html += '<div class="sidenav__head">' +
      '<span class="sidenav__id">' +
        '<b>' + esc(opts.head.title) + "</b>" +
        '<span>' + esc(opts.head.sub) + "</span>" +
      "</span>" +
      '<button class="sidenav__toggle" type="button" id="sidenavToggle"' +
        ' aria-expanded="' + (opts.collapsed ? "false" : "true") + '" aria-controls="sidenav-body"' +
        ' aria-label="' + (opts.collapsed ? "Expand the navigation" : "Collapse the navigation") + '">' +
        icon("chevL") +
      "</button>" +
    "</div>";

    html += '<div class="sidenav__scroll" id="sidenav-body">';

    html += '<ul class="sidenav__list">' +
      (opts.primary || []).map(function (p) {
        return row(p, p.href, p.current);
      }).join("") + "</ul>";

    (opts.groups || []).forEach(function (g) {
      html += '<p class="sidenav__group"><span>' + esc(g.group) + "</span></p>";
      html += '<ul class="sidenav__list">' + g.items.map(function (item) {
        var href = (item.href.charAt(0) === "#" || item.absolute) ? item.href : prefix + item.href;
        return row(item, href, !!opts.isCurrent && opts.isCurrent(item));
      }).join("") + "</ul>";
    });

    if (opts.note) html += '<p class="sidenav__note">' + esc(opts.note) + "</p>";

    html += "</div></div>";
    return html;
  }

  /* ---------- BEHAVIOUR ----------
     One handler, shared, because the collapse means the same thing in both
     documents and is stored in the same place. The state is written to the
     staging bridge rather than to a key of its own, so a reader who collapses the
     rail in the console still finds it collapsed in the staff shell: it is a
     preference about the chrome, which is the same category as the theme.

     The attribute is set on the element and the width is a custom property on the
     document, because the content column has to reflow with it and the column is
     not inside this element. */
  var releaseSub = null;

  function wireSidebar(root, onChange) {
    var nav = root.querySelector(".sidenav");
    var btn = root.querySelector("#sidenavToggle");
    if (!nav || !btn) return;

    /* The console builds its sidebar once per page load. The customer build
       rebuilds it on every staff render, because which rows a surface may see
       and which one is current both change with the route. Releasing the
       previous subscription before taking a new one is what keeps the second
       case from accumulating one listener per navigation. */
    if (releaseSub) { releaseSub(); releaseSub = null; }

    function paint(collapsed) {
      nav.setAttribute("data-collapsed", collapsed ? "true" : "false");
      document.documentElement.classList.toggle("nav-rail", !!collapsed);
      btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      btn.setAttribute("aria-label", collapsed ? "Expand the navigation" : "Collapse the navigation");
    }

    var collapsed = !!(window.STAGING && STAGING.getNavCollapsed());
    paint(collapsed);

    btn.addEventListener("click", function () {
      collapsed = !collapsed;
      paint(collapsed);
      if (window.STAGING) STAGING.setNavCollapsed(collapsed);
      if (onChange) onChange(collapsed);
    });

    /* Collapsed in another document. Follow it, and do not write back. */
    if (window.STAGING) {
      releaseSub = STAGING.subscribe(function (state, changed, origin) {
        if (origin !== "remote" || changed.indexOf("navCollapsed") < 0) return;
        collapsed = !!state.navCollapsed;
        paint(collapsed);
      });
    }
  }

  window.CONSOLE_NAV = {
    TABS: TABS,
    GROUPS: GROUPS,
    sidebar: sidebar,
    wireSidebar: wireSidebar,
    /* The groups this surface is allowed to see. The money area is the
       Operations Manager's, and everything else is everyone's.

       The test is an allow, not a deny. Listing the surfaces that are refused
       means every surface added later is admitted by default, including the
       harness's own visitor, which is how a staff route opened straight from a
       cold start ended up showing the revenue reports to nobody in particular.
       Naming the one surface that is allowed cannot fail that way.

       The console does not call this: it is signed in as the Club Manager and
       passes the whole list. As everywhere else in this build, hiding a row is
       not the security boundary, and the rail says so where it trims one. */
    groupsFor: function (surface) {
      var allowed = surface === "opsmanager" ? GROUPS : GROUPS.filter(function (g) { return !g.ops; });
      /* consoleOnly rows are dropped for every caller of this function, because
         the only caller is the customer build. The console reaches for GROUPS
         directly and keeps them. */
      return allowed.map(function (g) {
        var items = g.items.filter(function (it) { return !it.consoleOnly; });
        return items.length === g.items.length ? g : { group: g.group, ops: g.ops, items: items };
      });
    }
  };
})();
