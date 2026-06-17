// src/components/Header.tsx
import React from 'react';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
      <div className="flex items-center gap-4">
        {/* Removed the fake + button */}
        <h1 className="text-[28px] font-medium tracking-tight">EchoChamber Feed</h1>
      </div>
      
      <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
      
      <div className="flex-1 flex items-center w-full">
        <div className="flex items-center gap-2 text-gray-400 w-full max-w-md">
          <Search className="w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search mutations..." 
            className="bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 w-full"
          />
        </div>
        {/* Removed the fake 'See more' button */}
      </div>
    </div>
  );
}