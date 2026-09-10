// ---------------------------------------------------------------------------
// PHOTOGRAPH MANIFEST
//
// Every photograph lives in its own file in this folder (e.g. frame-1.js).
// To add a new photograph:
//   1. Create a new file here, e.g. `content/photographs/frame-7.js`:
//        const photograph = {
//          slug: "frame-7",
//          caption: "Your caption here",
//          tint: "linear-gradient(140deg,#hexA,#hexB 75%)", // placeholder
//          image: "/photos/frame-7.jpg", // optional, once you have a real photo
//        };
//        export default photograph;
//   2. Import it below and add it to the `photographs` array.
// That's it — it will automatically show up in the Frames section.
// ---------------------------------------------------------------------------

import frame1 from "./frame-1";
import frame2 from "./frame-2";
import frame3 from "./frame-3";
import frame4 from "./frame-4";
import frame5 from "./frame-5";
import frame6 from "./frame-6";
import frame7 from "./frame-7";
import frame8 from "./frame-8";
import frame9 from "./frame-9";
import frame10 from "./frame-10";
import frame11 from "./frame-11";
import frame12 from "./frame-12";
import frame13 from "./frame-13";
import frame14 from "./frame-14";
import frame15 from "./frame-15";
import frame16 from "./frame-16";
export const photographs = [frame1, frame2, frame3, frame4, frame5, frame6, frame7, frame8, frame9, frame10, frame11, frame12, frame13, frame14, frame15, frame16];

export default photographs;
