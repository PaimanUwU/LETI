import React, { useState, useEffect } from "react";
import {
  Save,
  FileText,
  Eye,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marked } from "marked";

type PageId = "ai" | "data" | "docs";

interface PageConfig {
  id: PageId;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const PAGES: PageConfig[] = [
  {
    id: "ai",
    title: "AI Engine Page",
    description: "Technical parameters & forecasting intervals",
    icon: FileText,
  },
  {
    id: "data",
    title: "Data Architecture",
    description: "Primary ingestion & crowdsourcing reports",
    icon: FileText,
  },
  {
    id: "docs",
    title: "Project Blueprint",
    description: "Institutional guidelines, objectives & team matrix",
    icon: FileText,
  },
];

export default function Setting() {
  const [selectedPage, setSelectedPage] = useState<PageId>("ai");
  const [markdown, setMarkdown] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load markdown content when active page changes
  useEffect(() => {
    const fetchPageContent = async () => {
      setLoading(true);
      setStatus(null);
      try {
        // 1. Try to fetch from backend settings API
        const res = await fetch(
          `http://localhost:8000/api/settings/${selectedPage}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.content) {
            setMarkdown(data.content);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn(
          "Backend API not reachable or failed, attempting local cache/static files.",
          e,
        );
      }

      // 2. Try localStorage cache
      const cached = localStorage.getItem(`leti_md_${selectedPage}`);
      if (cached) {
        setMarkdown(cached);
        setLoading(false);
        return;
      }

      // 3. Fallback to static markdown file
      try {
        const res = await fetch(`/markdown/${selectedPage}.md`);
        if (res.ok) {
          const text = await res.text();
          setMarkdown(text);
        } else {
          setStatus({
            type: "error",
            message: `Failed to fetch original markdown file /markdown/${selectedPage}.md`,
          });
        }
      } catch (e) {
        setStatus({
          type: "error",
          message: `Network error loading page content: ${(e as Error).message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [selectedPage]);

  // Update HTML preview when markdown text changes
  useEffect(() => {
    if (markdown) {
      const parsed = marked.parse(markdown);
      if (typeof parsed === "string") {
        setPreviewHtml(parsed);
      } else {
        parsed.then((res) => setPreviewHtml(res));
      }
    } else {
      setPreviewHtml("");
    }
  }, [markdown]);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    const token = localStorage.getItem("token");

    try {
      // 1. Attempt to save to backend setting API
      const res = await fetch(
        `http://localhost:8000/api/settings/${selectedPage}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content: markdown }),
        },
      );

      if (res.ok) {
        // Update local storage cache to match backend
        localStorage.setItem(`leti_md_${selectedPage}`, markdown);
        setStatus({
          type: "success",
          message: `Settings for "${PAGES.find((p) => p.id === selectedPage)?.title}" saved successfully to the backend!`,
        });
        setSaving(false);
        return;
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Server responded with status ${res.status}`,
        );
      }
    } catch (e) {
      console.warn(
        "Could not save to backend. Falling back to local storage cache.",
        e,
      );
      // 2. Fallback to saving in localStorage
      try {
        localStorage.setItem(`leti_md_${selectedPage}`, markdown);
        setStatus({
          type: "success",
          message: `Saved locally! (Backend API not reachable, changes cached in browser local storage)`,
        });
      } catch (err) {
        setStatus({
          type: "error",
          message: `Failed to save changes: ${(err as Error).message}`,
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        `Are you sure you want to reset the "${PAGES.find((p) => p.id === selectedPage)?.title}" content back to default? All unsaved edits will be lost.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      // Fetch default markdown from static path
      const res = await fetch(`/markdown/${selectedPage}.md`);
      if (res.ok) {
        const defaultText = await res.text();
        setMarkdown(defaultText);

        // Also update backend if we can
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:8000/api/settings/${selectedPage}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ content: defaultText }),
        }).catch(() => {});

        localStorage.setItem(`leti_md_${selectedPage}`, defaultText);
        setStatus({
          type: "success",
          message: "Content has been reset to system defaults!",
        });
      } else {
        setStatus({
          type: "error",
          message: "Failed to retrieve default markdown file.",
        });
      }
    } catch (e) {
      setStatus({
        type: "error",
        message: `Error resetting content: ${(e as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Manage and edit the content of your public Info pages dynamically
            using Markdown.
          </p>
        </div>
      </div>

      {/* Select Page Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAGES.map((page) => {
          const IconComponent = page.icon;
          const isSelected = selectedPage === page.id;
          return (
            <Card
              key={page.id}
              className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                  : ""
              }`}
              onClick={() => setSelectedPage(page.id)}
            >
              <CardHeader className="p-5 flex flex-row items-center gap-4 space-y-0">
                <div
                  className={`p-2.5 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-bold">
                    {page.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1">
                    {page.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Status Notifications */}
      {status && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
            status.type === "success"
              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          )}
          <span className="text-sm font-medium leading-relaxed">
            {status.message}
          </span>
        </div>
      )}

      {/* Main Editing Panel */}
      <Card className="border-slate-200 dark:border-slate-800">
        <Tabs defaultValue="edit" className="w-full">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-bold">
                Content Editor
              </CardTitle>
              <TabsList className="bg-muted">
                <TabsTrigger
                  value="edit"
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Markdown
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Live Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={loading || saving}
                className="text-xs h-9"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset Default
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading || saving}
                className="text-xs h-9 min-w-[100px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground font-medium">
                  Loading page content...
                </span>
              </div>
            ) : (
              <>
                <TabsContent value="edit" className="m-0 p-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Markdown Source
                    </label>
                    <textarea
                      value={markdown}
                      onChange={(e) => setMarkdown(e.target.value)}
                      placeholder="Write your markdown content here..."
                      className="min-h-[500px] w-full p-4 rounded-lg font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports standard markdown formatting: **bold**,
                      *italics*, # headers, - lists, tables, and links.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent
                  value="preview"
                  className="m-0 p-6 bg-slate-50/50 dark:bg-slate-950/20"
                >
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-8 bg-white dark:bg-slate-900 min-h-[500px] max-h-[700px] overflow-y-auto">
                    {previewHtml ? (
                      <article
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    ) : (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        No content to preview. Type some markdown first!
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
