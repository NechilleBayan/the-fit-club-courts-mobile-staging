/* ============================================================
   THE FIT CLUB COURTS - CLUB IDENTITY
   Loaded by the customer build and by every page of the admin console.

   WHY THIS FILE EXISTS.
   The two builds described two different clubs. The customer build has always
   said Silway-8, Polomolok, South Cotabato, with a Google Maps link pointing
   there and thefitclubph@gmail.com on the contact screen. The console had
   invented Unit 4, Brixton Street, Kapitolyo, Pasig City 1603, with a landline
   and a hello@thefitclubcourts.ph address on a domain nothing else in the
   project uses. Not a wording difference: two cities, 1,200 kilometres apart, in
   one prototype.

   The customer build wins, and not only because it came first. Its address is
   load bearing: it is what the maps link resolves to and what a visitor is told
   to travel to. A console that manages a club in a different province is not a
   detail a reviewer would forgive.

   The hours disagreed too, and there the argument runs the other way round. The
   console had the more detailed story: closed Mondays, 6:00 AM to 10:00 PM, 8:00
   PM on Sundays, carried consistently across three screens. It also contradicted
   the customer build's own booking data, which offers seven consecutive days with
   no exclusions and sells Open Play from 7:00 PM to 11:00 PM. Hours the club is
   shut cannot be hours it is selling. The functional data wins over the copy
   describing it, so the club is open daily, 6:00 AM to 11:00 PM, and the weekly
   Monday closure is gone from the console rather than the eleven o'clock window
   being cut short in the customer build.

   WHAT THIS FILE DOES NOT DO.
   It does not hydrate the console's static markup. Those 26 screens hold their
   address and hours as plain HTML and always have. What this gives is one place
   where the values are declared and one place to change them, with both builds
   reading from it in script, so the next person editing an address has somewhere
   obvious to start rather than a grep across two builds.
   ============================================================ */
(function () {
  "use strict";

  window.CLUB = {
    name:  "The Fit Club Courts",
    area:  "Silway-8, Polomolok, South Cotabato",
    email: "thefitclubph@gmail.com",
    phone: "+63 999 195 3170",
    courts: 4,

    /* Open daily. Declared as one pair rather than seven, because it is one pair:
       a per-day table would be seven copies of the same two times and a seventh
       place for one of them to drift. A closure is a different object and lives
       on the console's Closures screen, where the model already says closures cut
       into these hours without changing them. */
    opens: "6:00 AM",
    closes: "11:00 PM",
    hoursPhrase: "Open daily, 6:00 AM to 11:00 PM",

    maps: "https://www.google.com/maps/search/?api=1&query=The+Fit+Club+Courts+Silway-8+Polomolok+South+Cotabato"
  };
})();
