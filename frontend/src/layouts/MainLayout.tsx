import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Navbar />
      </header>

      {/* Normal fallback wrapper that lets content grow naturally */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="w-full border-t py-6 bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row px-4">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Built for community safety. © 2026 LETI Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
