import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";

const EXPIRATION_DAYS = 7;

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined); // au lieu de null
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const expiresAt = localStorage.getItem("token_expires_at");

    if (storedToken) {
      const isRemembered = localStorage.getItem("token") !== null;

      if (isRemembered && expiresAt && Date.now() > parseInt(expiresAt, 10)) {
        console.warn("⚠️ Token expiré — déconnexion automatique.");
        toast.info("Ta session a expiré. Reconnecte-toi 😉");
        logout();
        return;
      }

      try {
        const decoded = jwtDecode(storedToken);
        setUser({
          id: decoded.id,
          username: decoded.username,
          role: decoded.role || "user",
        });
        setToken(storedToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;

        // 👉 Affiche un toast uniquement si c'est une reconnexion automatique
        if (isRemembered) {
          toast.success(
            `🎉 Reconnecté automatiquement en tant que ${decoded.username}`
          );
        }
      } catch (err) {
        console.error("❌ Token invalide :", err);
        logout();
      }
    } else {
      setUser(null); // important si aucun token trouvé
    }
  }, []);

  const login = (newToken, remember = false, silent = false) => {
    if (remember) {
      localStorage.setItem("token", newToken);
      const expiresAt = Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem("token_expires_at", expiresAt.toString());
    } else {
      sessionStorage.setItem("token", newToken);
    }

    try {
      const decoded = jwtDecode(newToken);
      setUser({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role || "user",
      });
      setToken(newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      if (remember && !silent) {
        toast.success(
          `🎉 Reconnecté automatiquement en tant que ${decoded.username}`
        );
      }
    } catch (err) {
      console.error("❌ Erreur lors du décodage du token :", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires_at");
    sessionStorage.removeItem("token");
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
