"use client";

import { DialRoot, useDialKit } from "dialkit";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
        projectionScale: [1.18, .5, 2, .01],
      },
      light: {
        _collapsed: false,
        enabled: true,
        intensity: [2.4, 0, 2.4, .01],
        softness: [0, 0, 100, 1],
        coreDefinition: [.31, 0, 1, .01],
        coreFeather: [4.55, 0, 8, .05],
        warmth: [.3, 0, 1.5, .01],
        textureRelief: [1.66, 0, 2, .01],
        reflectedPaths: [1.66, 0, 3, .01],
        edgeBounce: [2.8, 0, 3, .01],
      },
      shadows: {
        _collapsed: true,
        tree: [1, 0, 1, .01],
        treeCoreFeather: [8, 0, 8, .05],
        leavesBehind: [1, 0, 1, .01],
        leavesInFront: [1, 0, 1, .01],
        leafCoreFeather: [5.5, 0, 8, .05],
        secondShadow: true,
        secondShadowOpacity: [.14, 0, .6, .01],
        secondShadowPanels: true,
        secondShadowPanelOpacity: [.29, 0, .6, .01],
        secondShadowX: [8, -30, 30, 1],
        secondShadowY: [-12, -30, 30, 1],
      },
      wall: {
        _collapsed: true,
        exposure: [.87, .35, 1.25, .01],
        texture: [2, 0, 2, .01],
        pores: [1.54, 0, 2, .01],
        roomVariation: [1.96, 0, 2, .01],
        diagonalShadow: [1.72, 0, 2, .01],
        cornerShadow: [1.59, 0, 2, .01],
      },
      postProduction: {
        _collapsed: true,
        kuwahara: true,
        kuwaharaStrength: [1.5, 0, 1.5, .01],
        grain: [2, 0, 2, .01],
        warmWash: [2, 0, 2, .01],
      },
      animation: {
        _collapsed: true,
        enabled: true,
        leafMovement: [1.84, 0, 2, .01],
        lightDrift: [2, 0, 2, .01],
      },
    },
    // A new stable id intentionally starts this study from its approved art
    // direction everywhere, rather than restoring older exploratory dials.
    { id: "window-01-art-direction-v2", persist: true }
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Breadcrumb>
          <BreadcrumbList className={styles.breadcrumbList}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className={styles.breadcrumbMuted}>Feelings</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Evening Window</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className={styles.gallery}>
        <h1 className={styles.artworkTitle}>Evening Window</h1>
        <section className={styles.stage} aria-label="Evening Window shadow study">
          <WallBackground controls={controls.wall} />
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
