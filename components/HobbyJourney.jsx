"use client";

import HobbyPanel from "./HobbyPanel";
import { createHeroScene } from "@/lib/heroBall";
import { createPenScene } from "@/lib/penScene";
import { createCameraScene } from "@/lib/cameraScene";

const hobbies = [
  
  {
    href: "/poems",
    title: "Poems",
    description:
      "Words I couldn't say out loud, so I taught them how to rhyme",
    cta: "Read the poems",
    builder: createPenScene,
  },
  {
    href: "/photography",
    title: "My Photographs",
    description:
      "I stop for things most people walk past.Sometimes, I bring them home in a frame.",
    cta: "View the frames",
    builder: createCameraScene,
  },
  {
    href: "/cricket",
    title: "On the pitch",
    description:
      "My cricket journey…",
    cta: "View the record",
    builder: createHeroScene,
  },
];

export default function HobbyJourney() {
  return (
    <div id="hobbies">
      {hobbies.map((h) => (
        <HobbyPanel key={h.href}{...h} />
      ))}
    </div>
  );
}
