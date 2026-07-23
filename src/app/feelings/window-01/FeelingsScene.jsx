"use client";

import { useEffect } from "react";
import { DialRoot, DialStore, useDialKit } from "dialkit";
import AppHeader from "@/components/core/AppHeader";
import WebGLBackground from "./WebGLBackground";
import WallBackground from "./WallBackground";
import styles from "./FeelingsScene.module.css";

export default function FeelingsScene() {
  const controls = useDialKit(
    "Window 01 — art direction",
    {
      master: {
        enabled: true,
        artworkOpacity: [1, 0, 1, .01],
        projectionScale: [1.39, .5, 2, .01],
      },
      light: {
        _collapsed: false,
        enabled: true,
        intensity: [2.4, 0, 2.4, .01],
        coreDefinition: [1, 0, 1, .01],
        coreFeather: [5, 0, 8, .05],
        warmth: [0, 0, 1.5, .01],
        textureRelief: [2, 0, 2, .01],
      },
      shadows: {
        _collapsed: true,
        branches: [1, 0, 1, .01],
        branchCoreFeather: [3.65, 0, 8, .05],
        leavesBehind: [1, 0, 1, .01],
        leavesInFront: [1, 0, 1, .01],
        leafCoreFeather: [4.1, 0, 8, .05],
        secondShadow: true,
        secondShadowOpacity: [.14, 0, .6, .01],
        secondShadowPanels: true,
        secondShadowPanelOpacity: [.32, 0, .6, .01],
        secondShadowX: [9, -30, 30, 1],
        secondShadowY: [-12, -30, 30, 1],
      },
      wall: {
        _collapsed: true,
        exposure: [.77, .35, 1.25, .01],
        texture: [2, 0, 2, .01],
        pores: [2, 0, 2, .01],
        roomVariation: [1.58, 0, 2, .01],
        cornerShadow: [0, 0, 2, .01],
      },
      ambientCanopy: {
        _collapsed: true,
        enabled: true,
        intensity: [1, 0, 1, .01],
        movement: [1, 0, 1, .01],
        scale: [2.09, .5, 2.5, .01],
        horizontalSpread: [1.5, .15, 1.5, .01],
        verticalReach: [1, .12, 1, .01],
        softness: [1, 0, 1, .01],
      },
      reflectedFlecks: {
        _collapsed: true,
        enabled: true,
        intensity: [.5, 0, 1, .01],
        movement: [.42, 0, 1, .01],
        size: [1, .5, 2, .01],
        spread: [.9, 0, 1, .01],
      },
      postProduction: {
        _collapsed: true,
        kuwahara: true,
        kuwaharaStrength: [2.46, 0, 3, .01],
        grain: [.89, 0, 3, .01],
        warmWash: [3, 0, 3, .01],
      },
      animation: {
        _collapsed: true,
        enabled: true,
        branchSway: [2, 0, 2, .01],
        lightDrift: [.9, 0, 2, .01],
      },
    },
    // Adds the reflected-light layer while retaining the approved branch rig.
    { id: "window-01-art-direction-v7", persist: true }
  );

  // Stable DialKit ids intentionally keep a panel alive during Fast Refresh.
  // Remove the superseded schemas so retired sliders cannot remain selectable
  // beside the current art-direction controls.
  useEffect(() => {
    DialStore.unregisterPanel("window-01-art-direction-v2");
    DialStore.unregisterPanel("window-01-art-direction-v3");
    DialStore.unregisterPanel("window-01-art-direction-v4");
    DialStore.unregisterPanel("window-01-art-direction-v5");
    DialStore.unregisterPanel("window-01-art-direction-v6");
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <AppHeader title="Evening Window" />
      </div>

      <div className={styles.gallery}>
        <h1 className={styles.artworkTitle}>Evening Window</h1>
        <section className={styles.stage} aria-label="Evening Window shadow study">
          <WallBackground
            controls={controls.wall}
            canopyControls={controls.ambientCanopy}
            reflectedFlecksControls={controls.reflectedFlecks}
          />
          <div className={styles.artworkColumn}>
            <div
              className={styles.artwork}
              style={{
                opacity: controls.master.enabled ? controls.master.artworkOpacity : 0,
                transform: `scale(${controls.master.projectionScale})`,
              }}
            >
              <WebGLBackground controls={controls} />
            </div>
          </div>
        </section>
      </div>
      <DialRoot productionEnabled position="top-right" />
    </main>
  );
}
