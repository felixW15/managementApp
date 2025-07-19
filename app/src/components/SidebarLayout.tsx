// src/components/SidebarLayout.tsx
import { useState } from "react";
import type { ReactNode } from "react";

type MenuItem = {
  label: string;
  key: string;
  component: ReactNode;
};

interface SidebarLayoutProps {
  onLogout: () => void;
  menuItems: MenuItem[];
}

export function SidebarLayout({ onLogout, menuItems }: SidebarLayoutProps) {
  const [activeKey, setActiveKey] = useState(menuItems[0]?.key);

  const activeComponent = menuItems.find((item) => item.key === activeKey)?.component;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-4 flex flex-col justify-between">
        <nav>
          <h2 className="text-xl font-bold mb-6">📋 MyApp</h2>
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.key}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveKey(item.key);
                  }}
                  className={`block font-medium ${
                    activeKey === item.key ? "text-blue-600" : "text-gray-800 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
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
      <main className="flex-1 p-6 bg-white">{activeComponent}</main>
    </div>
  );
}
