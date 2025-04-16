// ✅ ProtectedRoute.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function ProtectedRoute({ children, allowGuest = false }) {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const guest = localStorage.getItem("guestName");
    if (!user && !guest && !allowGuest) {
      navigate("/login");
    }
  }, [user, allowGuest, navigate]);

  const guest = localStorage.getItem("guestName");
  if (user || (allowGuest && guest)) {
    return children;
  }

  return null;
}
