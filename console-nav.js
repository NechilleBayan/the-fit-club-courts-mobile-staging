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

   THREE RENDERINGS, AND ONE OF THEM IS DELIBERATELY INCOMPLETE.
   The renderings are the rail, the bottom tab bar, and the launcher. The rail and
   the tab bar both draw TABS, five destinations, at every width. The launcher
   draws all of GROUPS, which is every destination there is, in a full screen
   dialog over whatever page you were already on.

   This paragraph used to say something else, and the something else is worth
   quoting because it was true when it was written and this file is what made it
   false: "The drawer stops being necessary at that width because everything it
   held is already on screen." Everything it held WAS on screen, because the rail
   drew all five groups under the five tabs, eighteen rows of it. That is a list
   you scan, not a navigation you aim at, and it still did not hold Check-in,
   Open Play, Maintenance, Blocked Dates and Closures, or Messages, which lived
   in more.html and in no rail at all. A rail can be complete or it can be
   aimable and at eighteen rows it was neither.

   So the rail stopped trying to be complete and the launcher started being the
   thing that is. The five destinations that earn permanent space are not the
   same set as the twenty two that need to exist, and pretending they were is
   what put five of them behind a leaf page for as long as it did. The drawer is
   still what a phone gets below 1024px; above it the launcher is what the
   Console row opens, and it is the only complete view of the console at any
   width.

   WHAT IS NOT SHARED, AND WHY.
   The PRIMARY section differs between the two documents on purpose. The console's
   primary section is TABS: Dashboard, Bookings, Courts, Staff, Console. The staff
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

  /* THE FIVE THAT EARN PERMANENT SPACE.
     Capped at five and this array is the enforcement: there is nowhere to put a
     sixth. What changed is what the cap means. It used to be a bottom bar limit
     that the desktop rail was free to ignore, and the rail did ignore it,
     drawing eighteen rows. Now it is the whole of both: the tab bar and the rail
     draw this array and nothing else, at every width.

     The fifth entry was More and is now Console, and the rename is the point
     rather than a tidy up. More is a shrug; it names the leftovers by saying
     they are leftovers, which is what they were while it was a page holding nine
     rows that had not earned a tab. Console names a thing: The whole of this
     back office, every destination in it, one screen. It opens the launcher
     instead of navigating.

     It keeps more.html as its href anyway, because that is the no-JS path and
     because a reader who hits the URL should land somewhere real. The launcher
     handler cancels the navigation when it runs. */
  var TABS = [
    { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "grid" },
    { id: "bookings",  label: "Bookings",  href: "bookings.html",  icon: "calendar" },
    { id: "courts",    label: "Courts",    href: "courts.html",    icon: "court" },
    { id: "staff",     label: "Staff",     href: "staff.html",     icon: "users" },
    { id: "console",   label: "Console",   href: "more.html",      icon: "dots" }
  ];

  /* EVERY DESTINATION THERE IS. THE LAUNCHER DRAWS ALL OF IT.
     This array used to be the secondary and system areas, the part of the
     console that was not a tab, and it deliberately did not repeat the five tab
     destinations. It does now, in Daily Operations, and the repetition is what
     makes it usable: the launcher is the one complete view of the console, and a
     complete view that omits the Dashboard because the Dashboard happens to also
     be a tab is a map with a hole where the front door is.

     Nothing renders both this and TABS in the same list, so nothing shows a
     destination twice. The rail and the tab bar draw TABS. The launcher and
     more.html draw this.

     FIVE DESTINATIONS JOINED HERE THAT WERE IN NO MODEL AT ALL. Check-in, Open
     Play, Maintenance, Blocked Dates and Closures, and Messages were markup in
     more.html and nowhere else, which meant they appeared in no rail and no
     drawer at any width on either build, and the only way to reach Check-in on a
     laptop was to notice that a tab called More existed and guess it was in
     there. That is the gap this whole task exists to close.

     desc is a card's supporting line, six words or fewer, saying what the
     destination is FOR rather than what it is called. Eight of them are lifted
     verbatim from more.html, which already had them and had them right; the rest
     are written to match that register, which is a comma list of the nouns you
     would find on the screen.

     ops:true marks a group the Operations Manager sees and Front Desk does not.
     It is honoured where a surface is known, which today is the staff shell in
     the customer build; the console itself is signed in as the Club Manager and
     shows everything. It is an allow list rather than a deny list on purpose, so
     a surface added later is refused by default rather than admitted by default.
     The launcher goes through groupsFor() like every other rendering does. As
     everywhere else in this prototype, hiding a row is not the security
     boundary, and every rendering says so where it trims one. */
  var GROUPS = [
    { group: "Daily Operations", items: [
      { label: "Dashboard",   href: "dashboard.html", icon: "grid",
        desc: "Today at a glance" },
      { label: "Bookings",    href: "bookings.html",  icon: "calendar",
        desc: "Reservations, changes, and conflicts" },
      { label: "Courts",      href: "courts.html",    icon: "court",
        desc: "Surfaces, status, and availability" },
      { label: "Staff",       href: "staff.html",     icon: "users",
        desc: "Who is on shift right now" },
      { label: "Check-in",    href: "check-in.html",  icon: "checkc",
        desc: "Arrivals for today, court by court", badge: "checkins", quiet: true },
      { label: "Open Play",   href: "open-play.html", icon: "play",
        desc: "Sessions, rosters, and capacity" }
    ] },
    { group: "Club", items: [
      { label: "Club Profile",        href: "club-profile.html", icon: "building",
        desc: "Name, address, and contact details" },
      /* Not the Staff tab. That one asks who is on shift right now; this is the
         roles, accounts, and pay area, and it has its own screen. */
      { label: "Staff Management",    href: "staff-manage.html", icon: "key",
        desc: "Roles, accounts, and pay" },
      { label: "Players / Customers", href: "players.html",      icon: "user",
        desc: "Members, guests, and history" },
      { label: "Maintenance",         href: "maintenance.html",  icon: "wrench",
        desc: "Court work, logs, and inspections" },
      { label: "Blocked Dates & Closures", href: "closures.html", icon: "lock",
        desc: "Rest days, holidays, and full day blocks" }
    ] },
    { group: "Money & Insights", ops: true, items: [
      { label: "Payments",            href: "payments.html", icon: "card",
        desc: "Balances, refunds, and receipts" },
      { label: "Reports & Analytics", href: "reports.html",  icon: "chart",
        desc: "Bookings, revenue, and utilization" },
      { label: "Rates & Promotions",  href: "rates.html",    icon: "tag",
        desc: "Pricing, discounts, and offers" }
    ] },
    /* Notifications moved here from System, and it moved because of the badge.
       It is the one row carrying unread, and a count sitting in a group called
       System reads as "a system event occurred", which is a thing you deal with
       later. Next to Messages it reads as "someone is trying to reach you",
       which is the same number meaning the more urgent of its two possible
       things. The group is the sentence the badge is read inside. */
    { group: "Communication", items: [
      { label: "Messages",      href: "messages.html",      icon: "message",
        desc: "Conversations with customers", badge: "messages", quiet: true },
      { label: "Notifications", href: "notifications.html", icon: "bell",
        desc: "System alerts and reminders", badge: "unread" }
    ] },
    { group: "System", items: [
      { label: "Operating Hours", href: "hours.html",    icon: "hours",
        desc: "Opening times, day by day" },
      { label: "Activity Log",    href: "activity.html", icon: "activity",
        desc: "Who changed what, and when" },
      { label: "Settings",        href: "settings.html", icon: "settings",
        desc: "Console preferences and defaults" },
      { label: "Help / Support",  href: "help.html",     icon: "help",
        desc: "Guides, contacts, and this build" },
      /* The way back to the customer build. It used to be a button on the
         console's contact sheet, which was the only page that had one and which
         no longer exists; without a home here, the console would be a folder you
         can enter and not leave except through the address bar. absolute keeps
         the prefix off it, since it is already relative to admin/, and
         consoleOnly keeps it out of the staff shell's rail, where a link to the
         document you are already reading would be furniture. */
      { label: "Customer Build",  href: "../index.html", icon: "arrowR",
        desc: "The other half of this prototype",
        absolute: true, consoleOnly: true }
    ] },
    /* Its own group rather than a sixth row of System, which is where it would
       go if the only question were tidiness. Log Out is the one destructive
       destination in the model and danger:true is how every rendering knows to
       draw it apart; folding it into a five row System list is how somebody
       aiming at Settings lands on it. */
    { group: "Session", items: [
      { label: "Log Out", href: "#logout", icon: "logout", danger: true,
        desc: "End this session" }
    ] }
  ];

  /* ---------- THE UTILITY STRIP ----------
     The slim rail of build controls above the app bar: The day and night toggle
     and the way into the staging harness. It lived in index.html and only there,
     which made it a control the customer half of the prototype had and the staff
     half did not, for no reason anybody had decided.

     It is here for the same reason the destination list is: It is one component
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
    /* name is the accessible label and is passed in, because the flask opens
       the harness sheet in the customer build and the staging notice in the
       console. Same control, same place, two things to open, and a button whose
       name is a lie about which one is worse than no name. */
    { id: "demo",  kind: "dialog", icon: "flask", label: "Demo" }
  ];

  function utilbar(opts) {
    var icon = opts.icon;
    var dark = opts.theme === "dark";
    return UTIL.map(function (c) {
      if (c.kind === "toggle") {
        /* NO aria-pressed, and the previous sweep put one here deliberately, so
           the reversal owes a reason. aria-pressed says a control is IN a state;
           this control's accessible name says what pressing it will DO. Together
           a screen reader announces "Switch to the day theme, pressed", and
           there is no reading of that sentence which tells you which theme is
           on. One of the two has to go.

           The name stays and the state goes, because the name is the half a
           reader can act on and because this control is phrased as an action
           everywhere it appears, in the strip and in both menus. What the theme
           currently is stays discoverable the way it always was: by looking at
           the page, which is the thing the control changes. */
        return '<button class="iconbtn iconbtn--bare" type="button" data-action="' + c.id + '"' +
          ' aria-label="' + (dark ? "Switch to the day theme" : "Switch to the night theme") + '">' +
          icon(dark ? "sun" : "moon") + "</button>";
      }
      /* The label is a real word and is hidden by CSS at widths where the strip
         has to share the line, not dropped from the markup. A button whose only
         name is a flask is a button nobody can ask for.

         The accessible name has to CONTAIN the visible one, which is WCAG 2.5.3
         and is not pedantry here: the visible word is "Demo" and a reader using
         voice control says what they can see. So the caller passes a name that
         starts with it and then says which dialog it opens, rather than
         replacing it. */
      return '<button class="iconbtn iconbtn--demo" type="button" data-action="' + c.id + '"' +
        ' aria-haspopup="dialog" aria-label="' + esc(opts.demoName || "Demo, the staging harness") + '">' +
        icon(c.icon) + '<span class="iconbtn__t">' + esc(c.label) + "</span></button>";
    }).join("");
  }

  /* ---------- THE STAGING NOTICE ----------
     What the strip's Demo control opens, and what both documents show once per
     sitting. Shared for the same reason the strip above it is: It is one
     statement about one prototype, and two copies would be two places for it to
     drift out of date. The text is here; the dialog element, the opening, and
     the closing are the document's, because the two shells already have their
     own modal idioms and neither needed a third.

     Three things and no more: That it is staging, that the data is sample, and
     that nothing is a real reservation. The last paragraph says where the signal
     lives after this is dismissed, which is the whole reason the strip and this
     were built next to each other. */
  function notice(opts) {
    var icon = opts.icon;
    var half = opts.half || "build";
    return '<div class="sheet__head">' +
        '<h2 id="staging-title">' + icon("flask") + "<span>Staging build</span></h2>" +
        /* The close glyph is named by the caller. The two sprites disagree on
           what it is called, "close" in the console and "x" in the customer
           build, and reconciling forty icons to settle one name is the thing
           this file has twice decided not to do. */
        '<button class="iconbtn iconbtn--bare" type="button" data-close aria-label="Close">' +
          icon(opts.close || "close") + "</button>" +
      "</div>" +
      '<div class="sheet__body">' +
        "<p>This is a staging build of the Fit Club Courts " + esc(half) + ". Everything " +
          "on it is sample data: The bookings, the players, the payments, and the " +
          "schedule are made up to show how the screens behave.</p>" +
        "<p><b>Nothing here is a real reservation</b>, and nothing you do on these " +
          "screens reaches the club, a customer, or a card.</p>" +
        '<p class="legal">' + esc(opts.reopen) + " Every screen carries a note at " +
          "its foot saying what is sample about that screen in particular.</p>" +
      "</div>" +
      /* The dismiss button is outside the scrolling body on purpose. Inside it,
         on a short window, the one control that closes this can be below the
         fold of a dialog that is covering the page, and Escape is not something
         to make a reader guess at. */
      '<div class="sheet__foot"><button class="btn btn--primary" type="button" data-close>Got it</button></div>';
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

  /* ---------- THE LAUNCHER ----------
     The full screen view of every destination there is, opened by the Console
     row in the rail and the Console tab in the bottom bar. It is the rendering
     that lets the other two be short.

     A REAL <dialog>, OPENED WITH showModal. The drawer already is one and the
     reasons are the same: backdrop, Escape, the background scroll lock, and the
     focus trap are all native, and a hand rolled trap is a well known way to
     ship a keyboard cage. Nothing here manages focus except returning it to the
     trigger on close, which is what the drawer already does.

     WHAT showModal COSTS, AND WHY THE BAR AND THE TABS ARE DRAWN AGAIN INSIDE.
     The brief asks for the app bar and the trigger to stay visible AND operable
     so that the same control closes the launcher. Those two cannot both be
     literally true: showModal puts the dialog in the top layer and makes
     everything outside it inert, so the real tab bar is visible through a
     transparent backdrop but cannot be clicked. The alternatives were a
     positioned <div>, which means hand rolling the trap, Escape, and the scroll
     lock, and is exactly what the drawer decided against; or leaving the reader
     with no control where they last pressed one. So the launcher draws its own
     bar and its own tab strip, from the same TABS array the real ones use, in
     the same places. The Console tab is drawn pressed and closes the launcher.
     To the reader it is the control they pressed, unmoved. To the accessibility
     tree it is a dialog with its own close control, which is the honest
     description of what it is. What it costs is one duplicated strip of markup,
     rendered from the shared array so it cannot say anything the real one does
     not.

     opts.icon        function(name) -> an <svg> string, the caller's own sprite
     opts.prefix      path prepended to every group href ("" or "admin/")
     opts.groups      the GROUPS subset this surface may see, from groupsFor()
     opts.counts      { unread: 4 } resolves a card's badge
     opts.badgeNoun   { unread: "unread" } names it for a screen reader
     opts.tabs        TABS, for the strip the phone keeps at the foot
     opts.currentTab  the id of the tab that opened this, drawn pressed
     opts.title       the heading, and the dialog's accessible name
     opts.note        the permission sentence, where a group was trimmed
     opts.isCurrent   function(item) -> is this the page underneath */
  /* THE CARDS THEMSELVES, RENDERED APART FROM THE DIALOG THAT USUALLY HOLDS THEM.
     Two things draw this grid: the launcher, and more.html, which is the page a
     reader lands on by typing the URL. They have to agree about every label,
     description, badge, and permission trim, and the only way to guarantee that
     is for there to be one function rather than two that look alike. This is
     that function; launcher() wraps it in a dialog and more.html drops it into a
     page.

     opts.headingLevel exists because the two callers sit at different depths.
     The dialog's own title is the h2, so its groups are h3. more.html's own
     title is the h1, so its groups are h2. Hardcoding either would leave one of
     them with a hole in its heading order, which is a real cost to a reader
     moving by headings and an invisible one to everybody else. */
  function cards(opts) {
    var icon = opts.icon;
    var prefix = opts.prefix || "";
    var counts = opts.counts || {};
    var groups = opts.groups || [];
    var isCurrent = opts.isCurrent || function () { return false; };
    var h = opts.headingLevel || "h3";

    function card(item) {
      var href = item.absolute ? item.href : prefix + item.href;
      var current = isCurrent(item);
      var n = item.badge ? counts[item.badge] : 0;
      /* Same rule the rail follows. Red is spent on money and on closed courts;
         a queue length asks for the quiet pill instead. */
      var count = n ? '<span class="countpill' + (item.quiet ? " countpill--quiet" : "") +
                      '" aria-hidden="true">' + n + "</span>" : "";
      var noun = (opts.badgeNoun && opts.badgeNoun[item.badge]) || "";
      var aria = count ? ' aria-label="' + esc(item.label + ", " + n + (noun ? " " + noun : "")) + '"' : "";
      /* aria-current already announces this one as the current page, so the
         visible chip is hidden from the tree rather than said twice. It is
         visible because a fill alone is not a state a reader can be sure of, and
         it stays a link because a card you cannot click is a card you will try
         to click. */
      var cur = current ? '<span class="lcard__cur" aria-hidden="true">Current</span>' : "";
      return '<a class="lcard' + (item.danger ? " lcard--danger" : "") + '" href="' + esc(href) + '"' +
        (current ? ' aria-current="page"' : "") + aria + ">" +
        '<span class="lcard__i">' + icon(item.icon) + "</span>" +
        '<span class="lcard__t">' + esc(item.label) + "</span>" +
        '<span class="lcard__d">' + esc(item.desc || "") + "</span>" +
        count + cur + "</a>";
    }

    return groups.map(function (g, i) {
      var id = (opts.idPrefix || "lsec-") + i;
      /* A real heading, and a section that points at it. Six labelled groups a
         screen reader can jump between is the difference between this and a
         flat list of twenty two links. */
      return '<section class="lsec" aria-labelledby="' + id + '">' +
        "<" + h + ' class="lsec__h" id="' + id + '">' + esc(g.group) + "</" + h + ">" +
        '<div class="lgrid">' + g.items.map(card).join("") + "</div></section>";
    }).join("");
  }

  function launcher(opts) {
    var icon = opts.icon;
    var prefix = opts.prefix || "";
    var sections = cards(opts);

    var tabs = (opts.tabs || []).map(function (t) {
      var on = t.id === opts.currentTab;
      /* The one that opened this is the one that closes it. The rest are real
         links out, which is what they are on the bar underneath. */
      if (on) {
        return '<button class="ltab ltab--on" type="button" data-close aria-expanded="true">' +
          '<span class="ltab__i">' + icon(t.icon) + "</span>" +
          "<span>" + esc(t.label) + "</span></button>";
      }
      return '<a class="ltab" href="' + esc(prefix + t.href) + '">' +
        '<span class="ltab__i">' + icon(t.icon) + "</span>" +
        "<span>" + esc(t.label) + "</span></a>";
    }).join("");

    return '<div class="launcher__bar">' +
      '<h2 class="launcher__t" id="launcherTitle">' + esc(opts.title || "Console") + "</h2>" +
      '<button class="iconbtn iconbtn--bare launcher__x" type="button" data-close' +
      ' aria-label="Close the console list">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="launcher__body">' + sections +
      (opts.note ? '<p class="launcher__note">' + esc(opts.note) + "</p>" : "") +
      "</div>" +
      (tabs ? '<nav class="launcher__tabs" aria-label="Main">' + tabs + "</nav>" : "");
  }

  /* Opening does not navigate and does not move the page underneath. The Console
     control carries a real href so a reader without JS lands on more.html, which
     is why the click is cancelled here rather than the href being left off. */
  function wireLauncher(doc) {
    var d = doc.getElementById("launcher");
    if (!d || !d.showModal) return null;
    /* CALLED AGAIN ON EVERY REPAINT, ON PURPOSE.
       The console builds its chrome once per page load and could get away with
       binding once. The customer build is a router: it repaints the tab bar on
       every route change, which destroys the trigger and builds a new one. So
       this has to be safe to call repeatedly, and "safe" means two different
       things for the two kinds of listener. The dialog is the same element every
       time, so its listeners are bound once behind a flag; the triggers are new
       elements, so each is bound the first time it is seen and flagged. Without
       the flags a shift spent moving between five routes would leave five close
       handlers on one dialog. */
    function mark(v) {
      [].forEach.call(doc.querySelectorAll("[data-launcher]"), function (t) {
        t.setAttribute("aria-expanded", v);
      });
    }

    [].forEach.call(doc.querySelectorAll("[data-launcher]"), function (t) {
      t.setAttribute("aria-haspopup", "dialog");
      if (t.getAttribute("aria-expanded") === null) t.setAttribute("aria-expanded", "false");
      if (t.dataset.launcherWired === "1") return;
      t.dataset.launcherWired = "1";
      t.addEventListener("click", function (e) {
        e.preventDefault();
        if (d.open) { d.close(); return; }
        d.__from = t;
        mark("true");
        d.showModal();
      });
    });

    if (d.dataset.launcherWired === "1") return d;
    d.dataset.launcherWired = "1";

    /* A click on the backdrop is a click on the dialog element itself. Same test
       the drawer uses, and the only line of this the platform does not give. */
    d.addEventListener("click", function (e) {
      if (e.target === d) { d.close(); return; }
      var c = e.target.closest && e.target.closest("[data-close]");
      if (c && d.contains(c)) d.close();
    });

    d.addEventListener("close", function () {
      mark("false");
      if (d.__from && d.__from.focus) d.__from.focus();
    });

    return d;
  }

  window.CONSOLE_NAV = {
    TABS: TABS,
    GROUPS: GROUPS,
    sidebar: sidebar,
    wireSidebar: wireSidebar,
    utilbar: utilbar,
    launcher: launcher,
    wireLauncher: wireLauncher,
    cards: cards,
    notice: notice,
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
      /* An allow list, not a deny list, and that is the whole point of the
         shape: a surface added later and not named here is refused the money
         area by default rather than admitted to it by default. */
      var full = surface === "opsmanager" || surface === "console";
      var allowed = full ? GROUPS : GROUPS.filter(function (g) { return !g.ops; });
      /* "console" is the back office reading its own list, and it is a surface
         here rather than a caller that skips this function. The launcher has to
         go through the permission gate like every other rendering; letting it
         reach for GROUPS directly would have been one rendering deciding for
         itself what it may see, which is the habit this function exists to stop.

         What the console keeps that nobody else does is consoleOnly rows. There
         is exactly one, Customer Build, and it is the way back out of the back
         office. Every other surface IS the customer build, where a link to the
         document you are already reading is furniture. */
      if (surface === "console") return allowed;
      return allowed.map(function (g) {
        var items = g.items.filter(function (it) { return !it.consoleOnly; });
        return items.length === g.items.length ? g : { group: g.group, ops: g.ops, items: items };
      });
    }
  };
})();
