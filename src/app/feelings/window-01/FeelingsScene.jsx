"use client";

import WebGLBackground from "./WebGLBackground";
import WallBackground from "./WallBackground";
import styles from "./FeelingsScene.module.css";

export default function FeelingsScene() {
  return (
    <main className={styles.page}>
      <WallBackground />
      <section className={styles.artwork} aria-label="Window shadow study">
        <WebGLBackground />
      </section>
    </main>
  );
}
