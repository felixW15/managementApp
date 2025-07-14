// src/App.tsx
import { useState, useEffect } from "react";
import AuthPage from "./pages/Auth";
import TaskList from "./components/TaskList";

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {!token ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <TaskList token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
