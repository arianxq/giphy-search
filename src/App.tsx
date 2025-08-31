import { useEffect, useState } from "react";
import axios from "axios";

/** —— Type definitions for Giphy API —— **/
type GiphyImage = { url: string; width: string; height: string };
type GiphyGif = {
  id: string;
  title: string;
  url: string; // GIPHY page URL
  images: {
    fixed_width: GiphyImage;   // Thumbnail for grid
    original: GiphyImage;      // Full-size for modal preview
  };
};

export default function App() {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<GiphyGif | null>(null); // Selected GIF for modal

  // Read API key from environment variables
  const apiKey = process.env.REACT_APP_GIPHY_API_KEY as string;

  // Update document title on first load
  useEffect(() => {
    document.title = "Giphy Search";
  }, []);

  // Perform search request
  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://api.giphy.com/v1/gifs/search", {
      params: { "api_key": apiKey, q: query, limit: 24, rating: "g", lang: "en" },
    });
      setGifs(res.data?.data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch GIFs");
    } finally {
      setLoading(false);
    }
  }

  // Copy Giphy page URL to clipboard
  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      alert("Copied GIPHY URL!");
    } catch {
      // Fallback for browsers without clipboard permission
      prompt("Copy this URL:", url);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      {/* Header with logo and title */}
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <img
          src="logo-white.svg"
          alt="logo"
          style={{ height: 36, background: "#111", borderRadius: 8, padding: 6 }}
        />
        <h1 style={{ margin: 0 }}>Giphy Search</h1>
      </header>

      {/* Search input and button */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search GIFs… e.g. cat, meme, dance"
          style={{
            flex: 1,
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: loading || !query.trim() ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Loader, error message, or empty state */}
      {loading && (
        <div style={{ margin: "16px 0" }}>
          <span style={{ display: "inline-block", marginRight: 8 }}>⏳</span> Loading…
        </div>
      )}
      {error && (
        <div style={{ margin: "16px 0", color: "crimson" }}>
          {error} — please try again.
        </div>
      )}
      {!loading && !error && gifs.length === 0 && (
        <div style={{ marginTop: 24, color: "#666" }}>
          Try a search like <code>cat</code>, <code>dog</code> or <code>funny</code>.
        </div>
      )}

      {/* Results grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {gifs.map((g) => (
          <div
            key={g.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {/* Click image to open modal preview */}
            <button
              onClick={() => setViewer(g)}
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "zoom-in",
              }}
              title="View GIF"
            >
              <img
                src={g.images.fixed_width.url}
                alt={g.title}
                loading="lazy"
                style={{ width: "100%", display: "block" }}
              />
            </button>

            {/* Links and copy button */}
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: 8,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <a href={g.url} target="_blank" rel="noreferrer" title="Open on GIPHY">
                View on GIPHY ↗
              </a>
              <button
                onClick={() => copy(g.url)}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: "6px 10px",
                  background: "#f8f8f8",
                  cursor: "copy",
                }}
                title="Copy GIPHY URL"
              >
                Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal preview */}
      {viewer && (
        <div
          onClick={() => setViewer(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 999,
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#000",
              padding: 12,
              borderRadius: 12,
              maxWidth: "min(90vw, 900px)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <img
              src={viewer.images.original.url}
              alt={viewer.title}
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", opacity: 0.9, fontSize: 14 }}>
                {viewer.title || "GIF"}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={viewer.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  Open on GIPHY ↗
                </a>
                <button onClick={() => copy(viewer.url)}>Copy URL</button>
                <button onClick={() => setViewer(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 24, color: "#777", fontSize: 12 }}>
        Built with React + TypeScript + axios • Powered by GIPHY API
      </footer>
    </div>
  );
}
