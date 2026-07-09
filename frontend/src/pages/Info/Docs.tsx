import { useMarkdown } from "@/hooks/useMarkdown";

export default function Docs() {
  const { html, loading } = useMarkdown("docs");

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
