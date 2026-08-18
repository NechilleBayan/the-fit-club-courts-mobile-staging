/* ============================================================
   THE FIT CLUB COURTS - SCENARIO MODEL
   Loaded by the customer build and by every page of the admin console.

   WHAT CHANGED, AND WHY.
   This used to be a flat array of eleven {key, label} pairs in the staging
   harness, plus a thirty-line switch in loadScenario() that did something
   different for each one. That shape was customer-flow-specific in three ways
   that stopped being true the moment the admin console started reading it:

     1. It said nothing about which surfaces a scenario means anything on.
     2. The seed lived in a switch, so the only way to know what "Late payment
        after release" does was to read the code that does it.
     3. Three screens keyed their behaviour off the scenario's LABEL string,
        comparing S.injected against "No Open Play scheduled" and "Loading
        availability" verbatim. Rewording a label silently broke a screen. One of
        those comparisons, against "Inventory conflict", matched a label that no
        longer exists in the list, so a whole branch of the court review screen
        had been dead for some time and nothing said so.

   Now each scenario carries its own seed as data, its own list of surfaces, and
   its own description of what the console should show. loadScenario() reads the
   seed rather than branching on the key, and the three screens compare keys.

   THE SEED IS A RECIPE, NOT A SNAPSHOT.
   It says which order to build, how to settle it, and where to land. It does not
   contain an order: an order carries absolute deadlines and generated
   identifiers, and the whole point of the staging bridge is that those do not
   cross a document boundary. The console reads the same key and draws its own
   sample for it. Same scenario, two independent renderings.

   HONESTY ABOUT WHERE A SCENARIO DOES NOTHING.
   Not every scenario means something on every surface, and the console says so
   rather than showing sample data that has quietly become untrue. A scenario
   with no `admin` block, or with no entry for the page being viewed, renders a
   marker saying this scenario has no consequence on this screen. That is the
   sandbox-honesty rule applied to state rather than to controls.
   ============================================================ */
(function () {
  "use strict";

  /* Every surface the harness can put the prototype into. `admin` is not a fifth
     role: it is the console view of `opsmanager`, and the surface picker says so.
     It appears here so a scenario can be marked as meaningful in the console
     without implying a separate identity. */
  var ALL = ["visitor", "player", "frontdesk", "opsmanager", "admin"];
  var STAFF = ["frontdesk", "opsmanager", "admin"];

  /* A row the console injects into one of its lists. Marked rather than blended:
     every screen already wears the hatched marker while a scenario is armed, and
     the chip says which rows arrived with it. */
  function row(title, sub, tags) {
    return '<div class="row row--two row--bar row--barhatch" data-scn-row>' +
      '<div class="row__line"><span class="row__main">' +
      '<span class="row__title">' + title + "</span>" +
      '<span class="row__sub">' + sub + "</span>" +
      "</span></div>" +
      '<div class="row__tags">' + tags +
      '<span class="chip chip--quiet">Scenario</span></div></div>';
  }
  function st(cls, icon, label) {
    return '<span class="st st--' + cls + '"><span data-icon="' + icon + '"></span>' + label + "</span>";
  }

  var SCENARIOS = [
    {
      key: "happy", label: "Happy court booking",
      blurb: "A court reservation paid for and confirmed, with passes issued.",
      surfaces: ALL,
      /* The only scenario that is not a forced state. It is what the product does
         when nothing goes wrong, so it renders no hatched marker. */
      natural: true,
      seed: { order: "court", settle: "paid", route: "/booking/:code" },
      /* No admin block, and none is missing. The happy path is what the console
         already shows on every screen: paid bookings, filled sessions, a clean
         queue. Injecting a row saying "a booking was confirmed" would be the
         console announcing its own resting state. `natural` keeps the marker off
         here for the same reason it keeps it off in the customer build. */
      admin: null
    },
    {
      key: "expiry", label: "Hold about to expire",
      blurb: "A held court time with ninety seconds left on the clock.",
      surfaces: ALL,
      seed: { order: "court", settle: "expiring", route: "/hold/:id" },
      admin: {
        headline: "A hold is about to expire.",
        pages: {
          dashboard: { says: "Court 1 below is a held booking, which is the state this scenario is counting down. The console shows holds; it does not watch their clocks, because a hold that expires simply stops being a booking." },
          bookings: { says: "The held booking is in the list. If the clock runs out it leaves the list rather than changing status, because nothing was ever confirmed." },
          "check-in": { says: "A hold cannot be checked in. It has no pass, because passes are minted at confirmation." }
        }
      }
    },
    {
      key: "failure", label: "Payment failure",
      blurb: "The provider declined the payment. Nothing was charged.",
      surfaces: ALL,
      seed: { order: "court", settle: "failed", route: "/status/:id" },
      admin: {
        headline: "A customer payment was declined.",
        pages: {
          dashboard: { says: "The declined payment is in Alerts and the pending count carries it.",
            inject: { slot: "alerts", html:
              '<a class="plate plate--crit" href="payments.html" data-scn-row>' +
              '<span class="plate__bar plate__bar--crit" aria-hidden="true"></span>' +
              '<span class="plate__head"><span data-icon="alert"></span>Payment Declined</span>' +
              '<span class="plate__phrase">Court booking &middot; PHP 1,400</span>' +
              '<span class="plate__meta">Card declined at the provider. Nothing was charged and no booking exists.</span></a>' },
            set: { "pending-payments": "5", "pending-payments-note": "1 declined, 1 overdue by 3 days" } },
          payments: { says: "The declined attempt is at the top of the ledger.",
            inject: { slot: "rows", html: row("Court booking &middot; PHP 1,400",
              "Card declined at the provider &middot; today", st("crit","alert","Failed")) } },
          notifications: { says: "The decline raised a notification.",
            inject: { slot: "rows", html: row("Payment declined",
              "Court booking &middot; nothing charged, no booking created", st("crit","alert","Failed")) } },
          bookings: { says: "No booking was created, so there is nothing here to show. That is the correct outcome of a declined payment." },
          tasks: { says: "A declined payment raises no task on its own. The customer can retry without staff." }
        }
      }
    },
    {
      key: "late", label: "Late payment after release",
      blurb: "Money arrived after the hold was already released.",
      surfaces: ALL,
      seed: { order: "court", settle: "late", route: "/status/:id" },
      admin: {
        headline: "A payment arrived after its hold had been released.",
        pages: {
          dashboard: { says: "The released hold is in Alerts and needs a decision.",
            inject: { slot: "alerts", html:
              '<a class="plate plate--crit" href="payments.html" data-scn-row>' +
              '<span class="plate__bar plate__bar--crit" aria-hidden="true"></span>' +
              '<span class="plate__head"><span data-icon="alert"></span>Late Payment</span>' +
              '<span class="plate__phrase">PHP 1,400 &middot; hold already released</span>' +
              '<span class="plate__meta">The time was given back before the money landed. Refund it or find the customer another slot.</span></a>' } },
          payments: { says: "The payment is held unallocated until somebody decides.",
            inject: { slot: "rows", html: row("PHP 1,400 received",
              "Hold released before the money landed &middot; unallocated", st("crit","alert","Needs review")) } },
          bookings: { says: "The time went back into availability, so there is no booking. That is what makes this an exception rather than a payment." },
          notifications: { says: "The late payment raised a notification.",
            inject: { slot: "rows", html: row("Payment received after release",
              "Nothing is held or assigned &middot; awaiting a decision", st("crit","alert","Needs review")) } },
          tasks: { says: "The decision is a task on the manager.",
            inject: { slot: "queue", html: row("Resolve a late payment",
              "Rea Salvador &middot; Club Manager",
              st("hold","clock","Pending") + '<span class="st st--prio">High</span>') } }
        }
      }
    },
    {
      key: "mismatch", label: "Amount mismatch, needs review",
      blurb: "A payment landed that does not match the order total.",
      surfaces: ALL,
      seed: { order: "court", settle: "short", route: "/status/:id" },
      admin: {
        headline: "A payment does not match its order, so no booking exists yet.",
        pages: {
          dashboard: { says: "The mismatch is in Alerts. No booking was created.",
            inject: { slot: "alerts", html:
              '<a class="plate plate--crit" href="payments.html" data-scn-row>' +
              '<span class="plate__bar plate__bar--crit" aria-hidden="true"></span>' +
              '<span class="plate__head"><span data-icon="alert"></span>Needs Review</span>' +
              '<span class="plate__phrase">PHP 1,350 received against PHP 1,400</span>' +
              '<span class="plate__meta">Fifty pesos short. The order is not confirmed and the court is not assigned.</span></a>' } },
          payments: { says: "The short payment sits unmatched at the top of the ledger.",
            inject: { slot: "rows", html: row("PHP 1,350 received",
              "Order total is PHP 1,400 &middot; 50 short", st("crit","alert","Needs review")) } },
          bookings: { says: "No booking. A payment that does not match cannot confirm one, which is the rule this scenario exists to show." },
          notifications: { says: "The mismatch raised a notification.",
            inject: { slot: "rows", html: row("Payment does not match its order",
              "PHP 1,350 against PHP 1,400 &middot; no booking created", st("crit","alert","Needs review")) } },
          tasks: { says: "Resolving it is a task on the manager.",
            inject: { slot: "queue", html: row("Resolve a payment mismatch",
              "Rea Salvador &middot; Club Manager",
              st("hold","clock","Pending") + '<span class="st st--prio">High</span>') } }
        }
      }
    },
    {
      key: "full", label: "Open Play window full",
      blurb: "The evening window has sold out. No checkout control is rendered.",
      surfaces: ALL,
      seed: { dials: { capacity: "full" }, route: "/openplay" },
      admin: {
        headline: "The evening Open Play window is full.",
        pages: {
          dashboard: { says: "The sessions count carries the full window.",
            set: { "openplay-note": "1 full, 2 nearly full" } },
          "open-play": { says: "Registration is closed and the waitlist is taking the overflow.",
            inject: { slot: "rows", html: row("Evening Open Play is full",
              "16 of 16 &middot; waitlist open and taking names",
              st("off","ban","Full")) } },
          "check-in": { says: "Every place is spoken for, so arrivals are the whole list.",
            inject: { slot: "rows", html: row("Evening Open Play &middot; 7:00 PM",
              "All four courts &middot; 16 of 16 registered", st("off","ban","Full")) } },
          bookings: { says: "A full window changes what can be sold, not what is already booked." }
        }
      }
    },
    {
      key: "names", label: "Names outstanding",
      blurb: "An Open Play booking paid for, with participant names still missing.",
      surfaces: ALL,
      seed: {
        draft: { qty: 4, players: ["Mika", "", "", " "] },
        order: "openplay", window: "w1", settle: "paid", route: "/booking/:code"
      },
      admin: {
        headline: "An Open Play booking is paid but its player names are outstanding.",
        pages: {
          "open-play": { says: "Three of the four places on that booking have no name against them.",
            inject: { slot: "rows", html: row("Four admissions, one name",
              "Mika, and three places with nobody named yet", st("hold","clock","Names outstanding")) } },
          "check-in": { says: "Three arrivals cannot be identified at the desk yet.",
            inject: { slot: "rows", html: row("Open Play &middot; 3 unnamed admissions",
              "Paid in full &middot; the organiser has not sent the names", st("hold","clock","Names outstanding")) } },
          notifications: { says: "The outstanding names raised a reminder.",
            inject: { slot: "rows", html: row("Player names still outstanding",
              "3 of 4 places unnamed &middot; invite sent to the organiser", st("hold","clock","Pending")) } },
          bookings: { says: "The booking itself is paid and confirmed. Only the names are missing." },
          tasks: { says: "Chasing names is the organiser's job, not the club's. No task is raised." }
        }
      }
    },
    {
      key: "event", label: "Private event lifecycle",
      blurb: "A private event inquiry that has been quoted and is awaiting a reply.",
      surfaces: ALL,
      seed: {
        inquiry: { ref: "EV 4210", state: "Quoted", date: "To be confirmed", time: "To be confirmed" },
        route: "/event/:ref"
      },
      admin: {
        headline: "A private event inquiry has been quoted and is awaiting a reply.",
        pages: {
          messages: { says: "The quote is the newest thread.",
            inject: { slot: "rows", html: row("EV 4210 &middot; Private event",
              "Quote sent &middot; awaiting the customer's reply", st("hold","clock","Quoted")) } },
          notifications: { says: "The quote raised a notification.",
            inject: { slot: "rows", html: row("Private event quoted",
              "EV 4210 &middot; date and time still to be confirmed", st("hold","clock","Quoted")) } },
          dashboard: { says: "The inquiry is waiting on the customer, not on the club, so it is not an alert.",
            inject: { slot: "alerts", html:
              '<a class="plate" href="messages.html" data-scn-row>' +
              '<span class="plate__bar plate__bar--hatched" aria-hidden="true"></span>' +
              '<span class="plate__head"><span data-icon="message"></span>Event Quoted</span>' +
              '<span class="plate__phrase">EV 4210 &middot; awaiting reply</span>' +
              '<span class="plate__meta">Date and time are still to be confirmed. Nothing is held on the calendar.</span></a>' } },
          bookings: { says: "An inquiry is not a booking and takes no court time until it is accepted." }
        }
      }
    },
    {
      key: "conflict", label: "Inventory conflict",
      blurb: "The chosen time was taken between choosing it and holding it.",
      surfaces: ALL,
      /* This one is a revival rather than an addition. The court review screen has
         always carried a banner for it, guarded by a comparison against the label
         "Inventory conflict", and no scenario has ever had that label, so the
         branch has been unreachable for as long as the list has looked like this.
         It is a real product state and the copy for it was already written, so it
         is cheaper to give it the key it was waiting for than to delete it. */
      seed: { route: "/court/review" },
      admin: {
        headline: "A court time was taken between a customer choosing it and holding it.",
        pages: {
          bookings: { says: "Whoever got there first has the booking. The second attempt created nothing." },
          dashboard: { says: "Two customers wanting one slot is demand, not an alert. Nothing was charged and nothing is stuck." }
        }
      }
    },
    {
      key: "offline", label: "Offline and stale",
      blurb: "Live availability cannot be reached. Prices and contact details still stand.",
      surfaces: ALL,
      seed: { dials: { connectivity: "availability_down" }, route: "/court" },
      admin: {
        headline: "Live availability cannot be reached.",
        /* The console's stale-data warning is the same warning the customer gets,
           worded for somebody who can do something about it. */
        banner: "Everything below was last confirmed before the availability service stopped responding. Treat court states as stale.",
        pages: {
          dashboard: { says: "Court states below are the last ones confirmed." },
          bookings: { says: "The list is the last confirmed one. A booking made in the last few minutes may be missing." },
          "check-in": { says: "Check-in still works: A pass is verified against the booking, not against availability." },
          "open-play": { says: "Registered counts are the last confirmed ones." }
        }
      }
    },
    {
      key: "empty", label: "No Open Play scheduled",
      blurb: "No Open Play windows are published. The private court path still works.",
      surfaces: ALL,
      seed: { route: "/openplay" },
      admin: {
        headline: "No Open Play windows are published.",
        pages: {
          dashboard: { says: "Nothing is scheduled, so the sessions count is zero.",
            set: { "openplay-num": "0", "openplay-note": "Nothing published" } },
          "open-play": { says: "There is nothing to run and nothing to register for.",
            inject: { slot: "rows", html: row("No Open Play scheduled",
              "Publish a window to open registration", st("off","ban","None published")) } },
          "check-in": { says: "No session means no Open Play arrivals. Court bookings still check in." }
        }
      }
    },
    {
      key: "loading", label: "Loading availability",
      blurb: "Availability has been asked for and has not come back yet.",
      surfaces: ALL,
      admin: {
        headline: "Availability has been asked for and has not come back yet.",
        banner: "Court and session states below have not been confirmed for this request. Nothing here is wrong yet; it is simply not answered.",
        pages: {
          dashboard: { says: "The court states below are unconfirmed for this request." },
          bookings: { says: "The list is unconfirmed for this request." }
        }
      },
      seed: { route: "/court" }
    }
  ];

  /* The customer build reads seeds; the console reads `admin`. Both read the
     label. Exposed as one object rather than three globals so a page that only
     needs the labels does not end up holding the seeds. */
  window.SCENARIOS = SCENARIOS;
  window.SCENARIO_BY_KEY = SCENARIOS.reduce(function (m, s) { m[s.key] = s; return m; }, {});
})();
