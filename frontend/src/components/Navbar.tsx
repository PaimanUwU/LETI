import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../components/ui/navigation-menu";
import { Shield, Brain, ChartNoAxesCombined } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
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
              <Link to="/submitreport">Report Crime</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Info</NavigationMenuTrigger>
            <NavigationMenuContent>          
              <ul className="grid w-[280px] gap-1 p-2">
                <li>
                  <NavigationMenuLink asChild>
                    <Link to="/info/Data" className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <ChartNoAxesCombined className="h-4 w-4 text-primary" />
                        <span>The Data</span>
                      </div>
                      <p className="text-xs leading-snug text-muted-foreground">
                        Learn how we collect and analyze crime statistics in Malaysia.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link to="/info/AI" className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Brain className="h-4 w-4 text-primary" />
                        <span>The AI</span>
                      </div>
                      <p className="text-xs leading-snug text-muted-foreground">
                        Learn about our AI prediction model.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link to="/info" className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>The Project</span>
                      </div>
                      <p className="text-xs leading-snug text-muted-foreground">
                        Learn about the behind the scenes of this project.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}>
              <Link to="/login">Portal Login</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
