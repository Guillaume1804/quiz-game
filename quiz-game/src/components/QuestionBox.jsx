export default function QuestionBox({ citation, choices, onAnswer }) {
  return (
    <div className="bg-white text-white rounded-xl shadow-xl p-6 w-full max-w-xl font-body border border-gray-200">
      {citation && (
        <p className="text-xl font-title text-center italic text-gray-200 mb-6">
          “{citation}”
        </p>
      )}

      <div className="flex flex-col gap-4">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(choice)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
