export default function Score({ value }) {
  return (
    <div className="text-lg font-title text-blue-700 font-bold">
      🧠 Score : <span className="font-body">{value}</span>
    </div>
  );
}
