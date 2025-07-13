import { useState, useEffect } from "react";
import AuthPage from "./pages/Auth";

function App() {
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage on startup
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Save token to localStorage when changed
  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <>
      {!token ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <div className="p-6">
          <h1 className="text-xl mb-4">Logged in!</h1>
          <p className="mb-2">JWT: {token.slice(0, 20)}...</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}

export default App;