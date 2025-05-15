import { useUser } from "../hooks/useUser";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowGuest = false }) {
  const { user } = useUser();
  const guest = localStorage.getItem("guestName");

  // Tant qu'on ne sait pas si un utilisateur est connecté ou pas
  if (user === undefined) return null;

  // ✅ Autorisation si connecté ou invité accepté
  if (user || (allowGuest && guest)) {
    return children;
  }

  // 🔴 Sinon redirection vers login
  return <Navigate to="/login" />;
}
