import { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";

const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-600"];

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Mot de passe",
  showStrength = false,
  required = true,
}) {
  const [visible, setVisible] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (showStrength) {
      const result = zxcvbn(value);
      setStrength(result.score);
    }
  }, [value, showStrength]);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
      >
        {visible ? "🙈" : "👁️"}
      </button>

      {showStrength && value && (
        <div className="mt-2">
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded transition-all ${strengthColors[strength]}`}
              style={{ width: `${(strength + 1) * 20}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-700 mt-1">{strengthLabels[strength]}</p>
        </div>
      )}
    </div>
  );
}
