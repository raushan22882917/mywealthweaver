import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CommandDialog, CommandInput, CommandList } from "@/components/ui/command";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import StockDetailsDialog from "@/components/StockDetailsDialog";

const Navbar = () => {
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string } | null>(null);
  const [open, setOpen] = React.useState(false);
  const user = useUser();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [search, setSearch] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    const fetchStocks = async () => {
      const { data } = await supabase
        .from("company_profiles")
        .select("symbol, short_name")
        .ilike("short_name", `%${search}%`)
        .limit(5);
      setStocks(data || []);
    };

    if (search) {
      fetchStocks();
    } else {
      setStocks([]);
    }
  }, [search]);

  const handleSearch = (e: any) => {
    setSearch(e.target.value);
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-64">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Take control of your finances with ease.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Link href="/" className="px-4 py-2 hover:bg-gray-100 rounded-md">
                Dashboard
              </Link>
              <Link
                href="/calendar"
                className="px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                Calendar
              </Link>
              <Link
                href="/top-stocks"
                className="px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                Top Stocks
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                Profile
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <CommandDialog open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Search Stocks
              </Button>
            </SheetTrigger>
            <CommandContent>
              <CommandInput
                placeholder="Type a command or search..."
                onChange={handleSearch}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Stocks">
                  {stocks.map((stock) => (
                    <CommandItem
                      key={stock.symbol}
                      onSelect={() => {
                        setOpen(false);
                        setSelectedStock({ symbol: stock.symbol });
                        setIsStockDialogOpen(true);
                      }}
                    >
                      <span>{stock.symbol}</span>
                      <span>{stock.short_name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandContent>
          </CommandDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

            <StockDetailsDialog
              symbol={selectedStock?.symbol || ''}
              open={isStockDialogOpen}
              onOpenChange={setIsStockDialogOpen}
            />
    </div>
  );
};

export default Navbar;

interface CommandContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandContent = React.forwardRef<HTMLDivElement, CommandContentProps>(
  ({ className, ...props }, ref) => (
    <div className="h-full w-full max-w-[400px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80" {...props} />
  )
);
CommandContent.displayName = "CommandContent"
