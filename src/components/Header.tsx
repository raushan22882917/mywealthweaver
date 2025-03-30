
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10",
        isScrolled ? "glass backdrop-blur-md border-b border-neutral-200/20" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a 
          href="/" 
          className="flex items-center"
          aria-label="Home"
        >
          <span className="text-xl font-medium tracking-tight">Design</span>
        </a>

        <nav className="hidden md:flex space-x-8">
          {navItems.map((item, index) => (
            <a
              key={item.name}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-black/60 relative py-2 px-1",
                pathname === item.path ? "text-black" : "text-black/70",
                `animate-fade-in stagger-${index + 1}`
              )}
            >
              {pathname === item.path && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black/80 rounded-full" />
              )}
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center space-x-4 animate-fade-in stagger-4">
          <button 
            className="py-2 px-4 rounded-full bg-black text-white text-sm font-medium transition-all hover:bg-black/90 hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
