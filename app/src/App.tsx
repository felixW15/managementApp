// src/App.tsx
import { useState, useEffect } from "react";
import AuthPage from "./pages/Auth";
import { Tasks } from "./components/TaskList";
import { setOnUnauthorized } from "./api/tasks";
import { SidebarLayout } from "./components/SidebarLayout";
import { MediaComponent } from "./components/MediaManager";

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  useEffect(() => {
    if (token) {
      setOnUnauthorized(() => {
        console.warn("Token expired. Logging out.");
        handleLogout();
      });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="mx-auto">
      {!token ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <SidebarLayout
        onLogout={handleLogout}
        menuItems={[
          {
            label: "Tasks",
            key: "tasks",
            component: <Tasks token={token} />,
          },
          {
            label: "Media",
            key: "media",
            component: <MediaComponent token={token} />,
          },
        ]}
      />
      )}
    </div>
  );
}

export default App;

