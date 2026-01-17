"use client";

import { ChevronDown, User } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navigationConfigMap } from "@/config/navigation.config";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router";
import { UserDropdownMenu } from "./user-dropdown-menu";

export function Navbar() {
  const { user } = useAuth();
  const displayName = user?.nama || "User";

  return (
    <header className="bg-background dark:bg-card sticky top-0 z-50 flex flex-col w-full items-center">
      <div className="w-full border-b">
        <div className="flex h-(--header-height) app-container w-full items-center justify-between gap-2">
          <Link to="/">
            <img
              src="/assets/images/widyatama-logo.png"
              className="h-10 w-auto max-w-full object-contain"
            />
          </Link>
          <UserDropdownMenu
            trigger={
              <a className="flex items-center gap-1 md:gap-2 cursor-pointer">
                <div className="size-9 rounded-full shrink-0 cursor-pointer bg-muted flex items-center justify-center">
                  <User className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-col md:flex hidden">
                  <p className="font-medium text-sm">{displayName}</p>
                </div>
                <ChevronDown className="md:block hidden" size={16} />
              </a>
            }
          />
        </div>
      </div>
      <div className="w-full border-b py-1 bg-background dark:bg-muted">
        <div className="app-container">
          <NavbarNavigation />
        </div>
      </div>
    </header>
  );
}

function NavbarNavigation() {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Get navigation items based on user role
  const visibleNavItems = user?.type ? navigationConfigMap[user.type] : [];

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex-wrap">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;

          // Render navigation item with sub-items (dropdown)
          if (item.subItems && item.subItems.length > 0) {
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger className="bg-transparent flex items-center gap-2 pl-4">
                  <Icon className="h-4 w-4 text-foreground" />
                  <span>{item.label}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-4">
                    <li>
                      {item.subItems.map((subItem) => (
                        <NavigationMenuLink asChild key={subItem.label}>
                          <Link to={subItem.href}>{subItem.label}</Link>
                        </NavigationMenuLink>
                      ))}
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }

          // Render simple navigation link
          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link
                  to={item.href || "#"}
                  className="bg-transparent flex items-center gap-2 px-4"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
