import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ CORRECT
import axios from "axios";
import { UserContext } from "./UserContext";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("✅ Token décodé :", decoded);
        setUser(decoded);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (err) {
        console.error("❌ Token invalide :", err);
        localStorage.removeItem("token");
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (err) {
      console.error("Erreur lors du décodage du token :", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
