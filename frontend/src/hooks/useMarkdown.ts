import { useState, useEffect } from "react";
import { marked } from "marked";

export function useMarkdown(pageId: "ai" | "data" | "docs") {
  const [content, setContent] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // 1. Try to fetch from the backend settings API
        const res = await fetch(`http://localhost:8000/api/settings/${pageId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            setContent(data.content);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn(`Backend API failed for ${pageId}, checking fallback paths:`, e);
      }

      // 2. Try localStorage cache
      const cached = localStorage.getItem(`leti_md_${pageId}`);
      if (cached) {
        setContent(cached);
        setLoading(false);
        return;
      }

      // 3. Fallback to static markdown file
      try {
        const res = await fetch(`/markdown/${pageId}.md`);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
        }
      } catch (e) {
        console.error(`Failed to load static markdown for ${pageId}:`, e);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [pageId]);

  useEffect(() => {
    if (content) {
      const parsed = marked.parse(content);
      if (typeof parsed === "string") {
        setHtml(parsed);
      } else {
        parsed.then((res) => setHtml(res));
      }
    }
  }, [content]);

  return { content, html, loading, setContent };
}
