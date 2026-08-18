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

  /* ---------- THE UTILITY STRIP ----------
     The slim rail of build controls above the app bar: the day and night toggle
     and the way into the staging harness. It lived in index.html and only there,
     which made it a control the customer half of the prototype had and the staff
     half did not, for no reason anybody had decided.

     It is here for the same reason the destination list is: it is one component
     rendered by two documents, and a second copy is a second place to change it
     and therefore a place to forget to. Same division of labour as the sidebar
     above. The model and the markup are here; the icon function comes from the
     document, because the console keeps its glyphs as path strings and the
     customer build keeps its as <symbol> elements, and reconciling those two
     sprites is still a separate question. The actions are the document's too:
     both emit data-action="theme" and data-action="demo", and each shell already
     has a delegated handler that is the right place to say what those mean.
     Demo means something different on each side, which is exactly why the click
     is not wired here.

     A LIST RATHER THAN TWO HARD CODED BUTTONS. There are two controls and the
     rendering could have been two lines of string concatenation. It is a model
     because the strip's whole reason to be shared is that the third build
     control, whenever it arrives, has one place to be added rather than two.

     WHAT THE PHONE GETS, AND WHY IT IS NOT THIS. Below 1024px the strip does not
     exist, and that is a decision rather than an omission. It costs 36px of
     permanent vertical space, and on a 390x844 screen the console already spends
     118 of 844 on its app bar and tab bar; a third strip would take the chrome
     past 18% of the viewport to carry two controls a reader touches at most once
     a session. Both are reachable on a phone from the menu the shell already
     has: the customer build puts them at the foot of its account sheet, and the
     console now puts them at the foot of its drawer. No width shows two copies
     of either, which is the rule the customer build's own comment states and
     this is the console adopting it rather than inventing a second answer. */
  var UTIL = [
    { id: "theme", kind: "toggle" },
    { id: "demo",  kind: "dialog", icon: "flask", label: "Demo", name: "Staging harness" }
  ];

  function utilbar(opts) {
    var icon = opts.icon;
    var dark = opts.theme === "dark";
    return UTIL.map(function (c) {
      if (c.kind === "toggle") {
        /* aria-pressed rather than role="switch": the control is a button that
           flips a setting, and its own icon and label already say which way it
           is pointing. The accessible name changes with the state because the
           glyph is the only visible label. */
        return '<button class="iconbtn iconbtn--bare" type="button" data-action="' + c.id + '"' +
          ' aria-pressed="' + dark + '"' +
          ' aria-label="' + (dark ? "Switch to the day theme" : "Switch to the night theme") + '">' +
          icon(dark ? "sun" : "moon") + "</button>";
      }
      /* The label is a real word and is hidden by CSS at widths where the strip
         has to share the line, not dropped from the markup. A button whose only
         name is a flask is a button nobody can ask for. */
      return '<button class="iconbtn iconbtn--demo" type="button" data-action="' + c.id + '"' +
        ' aria-haspopup="dialog" aria-label="' + esc(c.name) + '">' +
        icon(c.icon) + '<span class="iconbtn__t">' + esc(c.label) + "</span></button>";
    }).join("");
  }

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
     opts.head        { title, sub } the identity block under the brand
     opts.home        href the wordmark links to, or nothing to leave it inert
     opts.brandLabel  the accessible name for the mark, since the mark is a
                      picture of the club's name and carries no text of its own
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

    /* ---------- THE BRAND ROW ----------
       Two rows, not one. The head used to be the person and nothing else, which
       left the console as the only surface in the build that never said whose
       club it was; the customer header has carried the wordmark since it had a
       header. Putting the mark on the identity's own line was tried and is what
       these two rows are avoiding: 264px minus a 44px toggle does not hold a
       wordmark and "Rea Salvador" at once without one of them truncating, and
       the one that truncates is always the name.

       So the brand takes the row that is height-matched to the app bar, which is
       the row that has to align with the bar beside it anyway, and the identity
       drops to a quieter row underneath where it has the full width to itself.

       The mark is painted as a background on an empty span and named in a
       visually hidden sibling. It is the same reasoning the customer build's
       .wordmark uses: the mark is a picture of the club's name, so an <img alt>
       would have a screen reader read the club name here and again in the
       identity row two lines down. The link wrapper is what carries the name,
       and it says "home" rather than the club, because that is what activating
       it does.

       opts.home is a href. Where a surface has no home to point at, the brand
       renders as a plain span and is inert, rather than a link to "#" that moves
       focus and does nothing. */
    var markInner = '<span class="sidenav__mark" aria-hidden="true"></span>';
    var brand = opts.home
      ? '<a class="sidenav__brand" href="' + esc(opts.home) + '">' + markInner +
        '<span class="sidenav__vh">' + esc(opts.brandLabel || "The Fit Club Courts, home") + "</span></a>"
      : '<span class="sidenav__brand">' + markInner +
        '<span class="sidenav__vh">' + esc(opts.brandLabel || "The Fit Club Courts") + "</span></span>";

    html += '<div class="sidenav__head">' +
      brand +
      '<button class="sidenav__toggle" type="button" id="sidenavToggle"' +
        ' aria-expanded="' + (opts.collapsed ? "false" : "true") + '" aria-controls="sidenav-body"' +
        ' aria-label="' + (opts.collapsed ? "Expand the navigation" : "Collapse the navigation") + '">' +
        icon("chevL") +
      "</button>" +
    "</div>";

    /* The identity, on its own row below the brand. Outside .sidenav__head so it
       is not inside the block whose height is pinned to the app bar's, and so
       collapsing can drop it entirely: a name clipped to 4.5rem is not a name,
       and the avatar in the app bar is already the console's answer to "who am
       I" at every width. */
    html += '<div class="sidenav__who">' +
      '<span class="sidenav__id">' +
        '<b>' + esc(opts.head.title) + "</b>" +
        '<span>' + esc(opts.head.sub) + "</span>" +
      "</span>" +
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
    utilbar: utilbar,
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
