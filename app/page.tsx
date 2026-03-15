"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import TouRateCalculator from "./components/TouRateCalculator";
import ShiftKWCalculator from "./components/ShiftKWCalculator";

export default function Page() {
  const [menu, setMenu] = useState<"tou" | "shift">("tou");

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-8">
        
      <div className="mx-auto w-full space-y-6">
            
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight">
            ⚡️ TOU Analyzer Tool ⚡️
          </h1>
          <Navbar active={menu} onChange={setMenu} />
        </div>
    
        <div className="transition-all duration-300">
          {menu === "tou" ? <TouRateCalculator /> : <ShiftKWCalculator />}
        </div>
      </div>
  
      <footer className="fixed bottom-4 right-6 pointer-events-none">
        {process.env.BUILD_TIME && (
        <p className="text-xs font-semibold text-gray-300">
          Build time: {new Date(process.env.BUILD_TIME!).toLocaleString()}
        </p>
      )}
      </footer>
    </main>

      
  );
}