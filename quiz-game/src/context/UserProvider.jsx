// ✅ UserProvider.jsx
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        console.log("✅ Token décodé :", decoded);

        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role || "user",
        });

        setToken(storedToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      } catch (err) {
        console.error("❌ Token invalide :", err);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common["Authorization"];
      }
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    try {
      const decoded = jwtDecode(newToken);

      setUser({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role || "user",
      });

      setToken(newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } catch (err) {
      console.error("❌ Erreur lors du décodage du token :", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
