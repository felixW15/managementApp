// src/App.tsx
import { useState, useEffect } from "react";
import AuthPage from "./pages/Auth";
import { Tasks } from "./components/TaskList";
import { setOnUnauthorized } from "./api/tasks";

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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {!token ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
          <Tasks token={token} />
        </>
      )}
    </div>
  );
}

export default App;

