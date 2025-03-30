
import React from "react";
import { cn } from "@/lib/utils";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white to-neutral-100 z-0"
        aria-hidden="true"
      />
      
      {/* Decorative shapes */}
      <div 
        className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-blue-50 filter blur-3xl opacity-50 animate-float"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-purple-50 filter blur-3xl opacity-50 animate-float"
        style={{ animationDelay: '2s' }}
        aria-hidden="true"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full">
        <div className="flex flex-col items-center text-center">
          <p className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-black/5 backdrop-blur-sm border border-black/10 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Beautifully crafted experiences
          </p>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-4 md:mb-6 animate-fade-in stagger-1">
            Elevate Your<br />Digital Experience
          </h1>
          
          <p className="text-lg md:text-xl text-black/70 max-w-3xl mb-8 md:mb-10 animate-fade-in stagger-2">
            Where meticulous design meets thoughtful functionality. Experience the perfect balance of form and purpose.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-3">
            <button className="px-8 py-4 bg-black text-white rounded-full text-base font-medium transition-all hover:bg-black/90 hover:scale-105 shadow-subtle">
              Get Started
            </button>
            <button className="px-8 py-4 border border-black/10 rounded-full text-base font-medium bg-white/50 backdrop-blur-sm transition-all hover:bg-white hover:border-black/20">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="mt-20 md:mt-28 max-w-5xl mx-auto animate-fade-in-up stagger-4">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-elevated bg-white/50 backdrop-blur border border-white/60">
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <p className="text-neutral-400 font-medium">Hero Image</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
