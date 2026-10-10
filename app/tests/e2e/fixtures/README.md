# Umami tracker fixture

`umami-v3.2.0.js` is the unmodified Umami 3.2.0 standard tracker source, retrieved
on 2026-10-06 from:
https://raw.githubusercontent.com/umami-software/umami/v3.2.0/src/tracker/index.js

The MIT license is preserved in `UMAMI-LICENSE`.

The analytics browser tests replace the 2 build-time collection placeholders and
intercept all requests to the statistics service. They exercise the real tracker
without sending test visits or events to production.
