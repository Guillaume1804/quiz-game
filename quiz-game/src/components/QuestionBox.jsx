export default function QuestionBox({ citation, choices, onAnswer }) {
    return (
      <div className="bg-gray-800 p-4 rounded shadow-md">
        <p className="text-xl mb-4">{citation}</p>
        <div className="flex flex-col gap-2">
          {choices.map((choice, idx) => (
            <button
              key={idx}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              onClick={() => onAnswer(choice)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    );
  }
  