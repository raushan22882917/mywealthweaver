
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogIn } from "lucide-react";
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
import { CommandDialog, CommandInput, CommandList } from "@/components/ui/command";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import StockDetailsDialog from "@/components/StockDetailsDialog";
import { Link, useNavigate } from "react-router-dom";
import { Session } from '@supabase/supabase-js';

const Navbar = () => {
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string } | null>(null);
  const [open, setOpen] = React.useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/auth");
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
              <Link to="/" className="px-4 py-2 hover:bg-gray-100 rounded-md">
                Dashboard
              </Link>
              <Link
                to="/dividend"
                className="px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                Dividend Calendar
              </Link>
              <Link
                to="/top-stocks"
                className="px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                Top Stocks
              </Link>
              {session && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 hover:bg-gray-100 rounded-md"
                >
                  Profile
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center space-x-4">
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
              placeholder="Search stocks..."
              value={search}
              onValueChange={setSearch}
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
                    <span className="ml-2 text-gray-500">{stock.short_name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>

          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Search Stocks
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>
                      {session.user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/dashboard">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
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
