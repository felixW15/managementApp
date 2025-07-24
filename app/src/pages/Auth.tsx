import { useState } from "react";
import { register, login } from "../api/auth";

export default function AuthPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true); // Start loading
  try {
    if (mode === "register") {
      await register(username, password);
      alert("Registration successful!");
      setMode("login");
    } else {
      const data = await login(username, password);
      onLogin(data.access_token);
    }
  } catch (err) {
    alert((err as Error).message);
  } finally {
    setLoading(false); // Stop loading
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {loading && <div className="mt-2 animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full mx-auto" />}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-2xl mb-4">{mode === "login" ? "Login" : "Register"}</h2>
        <input
          disabled={loading}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : mode === "login" ? "Login" : "Register"}
        </button>
        <button
          type="button"
          className="text-sm mt-2 text-blue-600"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          disabled={loading}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}
