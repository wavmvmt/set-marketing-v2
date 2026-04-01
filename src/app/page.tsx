"use client";

import { useState } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Splash from "@/components/Splash";
import Navbar from "@/components/Navbar";
import Scene1Arrival from "@/components/scenes/Scene1Arrival";
import Scene2TrustWall from "@/components/scenes/Scene2TrustWall";
import Scene3Arsenal from "@/components/scenes/Scene3Arsenal";
import Scene4Proof from "@/components/scenes/Scene4Proof";
import Scene5Operator from "@/components/scenes/Scene5Operator";
import Scene6Method from "@/components/scenes/Scene6Method";
import Scene7Voices from "@/components/scenes/Scene7Voices";
import Scene8Close from "@/components/scenes/Scene8Close";
import Footer from "@/components/Footer";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <Splash onComplete={() => setSplashDone(true)} />}
      <SmoothScroll>
        <Navbar />
        <main>
          <Scene1Arrival />
          <Scene2TrustWall />
          <Scene3Arsenal />
          <Scene4Proof />
          <Scene5Operator />
          <Scene6Method />
          <Scene7Voices />
          <Scene8Close />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
