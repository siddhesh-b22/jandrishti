import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] relative overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
