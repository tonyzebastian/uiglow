"use client";

import { ExternalLink, Link2, LoaderCircle, Search, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./LinkLibrary.module.css";

export default function LinkLibrary() {
  const [bookmarks, setBookmarks] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/bookmarks");
        if (!response.ok) throw new Error("Could not load the link library.");
        setBookmarks(await response.json());
      } catch (cause) {
        setMessage(cause.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const tags = useMemo(() => {
    const counts = new Map();
    bookmarks.forEach((bookmark) => bookmark.tags.forEach((tag) => {
      counts.set(tag.name, { ...tag, count: (counts.get(tag.name)?.count || 0) + 1 });
    }));
    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookmarks.filter((bookmark) => {
      const matchesTag = activeTag === "all" || bookmark.tags.some((tag) => tag.name === activeTag);
      const haystack = [bookmark.name, bookmark.url, bookmark.hostname, bookmark.page_title, bookmark.description, bookmark.site_name, ...bookmark.tags.map((tag) => tag.label)].filter(Boolean).join(" ").toLowerCase();
      return matchesTag && (!needle || haystack.includes(needle));
    });
  }, [activeTag, bookmarks, query]);

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.kicker}>REFERENCE LIBRARY</p><h1>Link <em>library.</em></h1><p className={styles.subtitle}>A small, living index of things worth returning to.</p></div>
    </header>

    <section className={styles.controls} aria-label="Link filters">
      <label className={styles.search}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search links, notes, and tags" /></label>
      <div className={styles.tagFilters}><button className={activeTag === "all" ? styles.activeTag : ""} onClick={() => setActiveTag("all")}>All links <span>{bookmarks.length}</span></button>{tags.map((tag) => <button key={tag.id} className={activeTag === tag.name ? styles.activeTag : ""} onClick={() => setActiveTag(tag.name)}>{tag.label} <span>{tag.count}</span></button>)}</div>
    </section>

    {message && <p className={styles.message}>{message}<button onClick={() => setMessage("")} aria-label="Dismiss message"><X size={15} /></button></p>}
    {isLoading ? <div className={styles.empty}><LoaderCircle className={styles.spin} size={22} /> Loading your library…</div> : filteredBookmarks.length ? <section className={styles.grid}>{filteredBookmarks.map((bookmark) => <BookmarkCard key={bookmark.id} bookmark={bookmark} />)}</section> : <div className={styles.empty}><Link2 size={26} /><h2>{bookmarks.length ? "Nothing matches that filter." : "Your library is waiting."}</h2><p>{bookmarks.length ? "Try another tag or search term." : "Add references through the D1 library."}</p></div>}
  </main>;
}

function BookmarkCard({ bookmark }) {
  const hasImage = Boolean(bookmark.image_url);
  return <article className={styles.card}>
    <a href={bookmark.url} target="_blank" rel="noreferrer" className={`${styles.preview} ${hasImage ? "" : styles.previewFallback}`}>{hasImage ? <img src={bookmark.image_url} alt="" /> : <Link2 size={31} />}<span>{bookmark.hostname}</span></a>
    <div className={styles.cardBody}><div className={styles.cardMeta}>{bookmark.favicon_url && <img src={bookmark.favicon_url} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<span>{bookmark.site_name || bookmark.hostname}</span></div><h2>{bookmark.name}</h2>{bookmark.description && <p>{bookmark.description}</p>}<div className={styles.cardFooter}><div className={styles.cardTags}>{bookmark.tags.map((tag) => <span key={tag.id}><Tag size={11} />{tag.label}</span>)}</div><div className={styles.actions}><a href={bookmark.url} target="_blank" rel="noreferrer" aria-label={`Open ${bookmark.name}`}><ExternalLink size={15} /></a></div></div></div>
  </article>;
}
