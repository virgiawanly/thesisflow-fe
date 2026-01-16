import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { Moon, User } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode } from "react";
// import { useIntl } from "react-intl";
import { Link } from "react-router";

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { logout, user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const displayName = user?.nama || "User";
  const displayUsername = user?.email ?? user?.username ?? "";

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <User className="size-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {displayUsername}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 px-3">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator /> */}

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2 px-3"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={resolvedTheme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
