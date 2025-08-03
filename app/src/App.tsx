import { useState, useEffect } from "react";
import AuthPage from "./pages/Auth";
import { Tasks } from "./components/TaskList";
import { setOnUnauthorized, validateToken } from "./api/tasks";
import { SidebarLayout } from "./components/SidebarLayout";
import { MediaComponent } from "./components/MediaManager";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // <- Add loading state

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const checkToken = async () => {
      if (storedToken) {
        const isValid = await validateToken(storedToken);
        if (isValid) {
          setToken(storedToken);
        } else {
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkToken();
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  useEffect(() => {
    if (token) {
      setOnUnauthorized(() => {
        console.warn("Token expired. Logging out.");
        handleLogout();
      });
    }
  }, [token]);

  if (loading) return <div className="text-center p-4">Loading...</div>;

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