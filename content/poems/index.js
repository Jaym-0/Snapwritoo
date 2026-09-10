// ---------------------------------------------------------------------------
// POEM MANIFEST
//
// Every poem lives in its own file in this folder (e.g. cover-drive.js).
// To add a new poem:
//   1. Create a new file here, e.g. `content/poems/my-new-poem.js`,
//      following the same shape as the existing files:
//        const poem = { slug: "my-new-poem", title: "My New Poem", lines: [...] };
//        export default poem;
//   2. Import it below and add it to the `poems` array.
// That's it — it will automatically show up on the site.
// ---------------------------------------------------------------------------

import coverDrive from "./a-long-way";
import contactSheet from "./the-light-you-carry";
import rainStoppedPlay from "./dear-october";
import harPalJeetHai from "./har-pal-jeet-hai";
import theLightYouCarry from "./the-light-you-carry";
import aLongWay from "./a-long-way";
import dekhoNaNazareMe from "./dekho-na-nazare-me";
import ineffableBeauty from "./ineffable-beauty";
import kabhisadkonparrehnewalonsemilkartodekho   from "./kabhi-sadkon-par-rehne-walon-se-milkar-to-dekho.js";
import bekhabar from "./bekhabar.js";
export const poems = [coverDrive, contactSheet, rainStoppedPlay, theLightYouCarry, bekhabar ,aLongWay,ineffableBeauty,harPalJeetHai, dekhoNaNazareMe, kabhisadkonparrehnewalonsemilkartodekho];

export default poems;
