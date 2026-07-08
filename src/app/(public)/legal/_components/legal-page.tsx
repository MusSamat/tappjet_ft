// Shared shell for the legal documents (/about, /terms, /privacy).
// Content is versioned inline per locale — legal text must not silently drift
// through translation-file edits; bump `version` + date on every change.

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-10">
      <h1 className="text-[24px] font-900 text-ink-900 dark:text-white">{doc.title}</h1>
      <p className="mt-1 text-[14px] font-600 text-ink-400">{doc.updated}</p>
      <div className="mt-6 space-y-6">
        {doc.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-[16px] font-900 text-ink-900 dark:text-white">{s.heading}</h2>
            {s.paragraphs.map((p, j) => (
              <p key={j} className="mt-2 text-[13.5px] font-500 leading-relaxed text-ink-600 dark:text-ink-300">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
