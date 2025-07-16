// src/components/SidebarLayout.tsx
import type{ ReactNode } from "react";

interface SidebarLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export function SidebarLayout({ children, onLogout }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-4 flex flex-col justify-between">
        <nav>
          <h2 className="text-xl font-bold mb-6">📋 MyApp</h2>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-gray-800 hover:text-blue-600 block font-medium"
              >
                Tasks
              </a>
            </li>
            {/* Add more nav links here later */}
          </ul>
        </nav>
        <button
          onClick={onLogout}
          className="text-red-600 hover:text-red-800 font-medium mt-4"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
