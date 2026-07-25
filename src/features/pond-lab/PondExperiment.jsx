"use client";

import AppHeader from "@/components/shared/AppHeader";
import { PondCanvas } from "./PondShaderGallery";

export default function PondExperiment() {
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <AppHeader title="Pond Experiment" />
    <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="text-xs font-medium uppercase tracking-[.18em] text-slate-400">Vault / Experiment</p><h1 className="mt-2 font-[family-name:var(--font-merriweather)] text-2xl font-bold tracking-tight">Layered pond</h1></div>
        <nav className="flex gap-4 text-sm text-slate-500"><a className="hover:text-slate-900" href="/vault">Vault</a><a className="hover:text-slate-900" href="/vault/shaders">Shaders</a></nav>
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-slate-500">A composed reference implementation: shader water, paper grain, procedural reeds and two SVG ducks. Click the water to add a source-style ripple.</p>
      <div className="relative mx-auto aspect-[3/2] w-full max-w-[900px] overflow-hidden rounded-sm bg-[#183e68] shadow-sm"><PondCanvas /></div>
      <div className="mx-auto mt-5 grid max-w-[900px] gap-4 sm:grid-cols-3"><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-400">01</p><p className="mt-2 text-sm font-medium">Water + ripples</p><p className="mt-1 text-xs leading-5 text-slate-500">One WebGL draw pass with 12 live ripple uniforms.</p></div><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-400">02</p><p className="mt-2 text-sm font-medium">Paper pass</p><p className="mt-1 text-xs leading-5 text-slate-500">Generated once after sizing; no animation cost.</p></div><div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-400">03</p><p className="mt-2 text-sm font-medium">Plant pass</p><p className="mt-1 text-xs leading-5 text-slate-500">A separate animated 2D canvas above the water.</p></div></div>
    </main>
  </div>;
}
