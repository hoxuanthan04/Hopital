import { Outlet } from "react-router-dom";
import React, { useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:px-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;