const API_URL = "https://managementapp-hwaq.onrender.com"; // adjust if needed

export async function register(username: string, password: string) {
  const res = await fetch(`${API_URL}/register?username=${username}&password=${password}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login?username=${username}&password=${password}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // contains access_token
}
