import { Link, Outlet } from "react-router-dom";
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from "../components/ui/navigation-menu";
import { 
  Shield,
  Astroid
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6 text-primary" />
              <span>LETI</span>
            </Link>
          </div>

          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/">Dashboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/submit">Report Crime</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Info</NavigationMenuTrigger>
                <NavigationMenuContent className="-r-20">          
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <Shield className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            The Data
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Learn how we collect and analyze crime statistics in Malaysia.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <Astroid className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            The AI
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Learn how about our AI prediction model.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}>
                  <Link to="/login">Admin Login</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for community safety. © 2026 LETI Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
