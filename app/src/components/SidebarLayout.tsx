// src/components/SidebarLayout.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";

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
  const { toggleTheme, theme } = useTheme();

  const activeComponent = menuItems.find(
    (item) => item.key === activeKey
  )?.component;

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-42 h-screen fixed overflow-y-auto bg-gray-100 dark:bg-gray-800 border-r dark:border-gray-700 p-4 flex flex-col justify-between">
        <nav>
          <h2 className="text-xl font-bold mb-6">📋 Manager</h2>
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
                    activeKey === item.key
                      ? "text-blue-600"
                      : "text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{theme === "dark" ? "🌙" : "🌞"}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-colors duration-300"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-full"></div>
            </label>
          </div>
          <button
            onClick={onLogout}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium mt-4"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-white dark:bg-gray-900">
        {activeComponent}
      </main>
    </div>
  );
}
