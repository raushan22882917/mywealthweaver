import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Menu, MoonIcon, SunIcon, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-auto font-bold">
          Logo
        </Link>
        <Button
          variant="outline"
          className="ml-auto md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex ml-auto md:mr-4 items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/market-data" className="text-sm font-medium transition-colors hover:text-primary">
              Market Data
            </Link>
            <Link to="/dividend" className="text-sm font-medium transition-colors hover:text-primary">
              Dividend
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-2 gap-1">
                  Reports <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/reporting">Dividend Reports</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dividend-calendar">Dividend Calendar</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/education" className="text-sm font-medium transition-colors hover:text-primary">
              Education
            </Link>
            <Link to="/news" className="text-sm font-medium transition-colors hover:text-primary">
              News
            </Link>
            <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme((theme) => (theme === "light" ? "dark" : "light"))
            }
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/auth">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth">Sign Up</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isMobileMenuOpen && (
          <div className="absolute top-14 left-0 w-full bg-background border-b md:hidden">
            <nav className="flex flex-col gap-4 p-4">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/market-data" className="text-sm font-medium transition-colors hover:text-primary">
                Market Data
              </Link>
              <Link to="/dividend" className="text-sm font-medium transition-colors hover:text-primary">
                Dividend
              </Link>
              <Link to="/reporting" className="text-sm font-medium transition-colors hover:text-primary">
                Reporting
              </Link>
              <Link to="/education" className="text-sm font-medium transition-colors hover:text-primary">
                Education
              </Link>
              <Link to="/news" className="text-sm font-medium transition-colors hover:text-primary">
                News
              </Link>
              <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
                About
              </Link>
              <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
                Contact
              </Link>
              <Button asChild variant="secondary">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
