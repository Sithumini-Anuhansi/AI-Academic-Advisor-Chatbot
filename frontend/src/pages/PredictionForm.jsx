import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";

const initialForm = {
  attendance: "",
  test1: "",
  test2: "",
  assignment: "",
  study_hours: "",
};

const fields = [
  {
    name: "attendance",
    label: "Attendance",
    suffix: "%",
    min: 0,
    max: 100,
    placeholder: "e.g. 85",
    tip: "Your overall attendance percentage",
  },
  {
    name: "test1",
    label: "Internal Test 1",
    suffix: "/ 40",
    min: 0,
    max: 40,
    placeholder: "e.g. 30",
    tip: "Your score out of 40",
  },
  {
    name: "test2",
    label: "Internal Test 2",
    suffix: "/ 40",
    min: 0,
    max: 40,
    placeholder: "e.g. 28",
    tip: "Your score out of 40",
  },
  {
    name: "assignment",
    label: "Assignment score",
    suffix: "/ 10",
    min: 0,
    max: 10,
    placeholder: "e.g. 8",
    tip: "Your assignment score out of 10",
  },
  {
    name: "study_hours",
    label: "Daily study hours",
    suffix: "hrs",
    min: 0,
    max: 24,
    placeholder: "e.g. 4",
    tip: "Average hours you study per day",
  },
];

function ResultCard({ result, onReset }) {
  const isPass = result.prediction === "PASS";

  return (
    <div
      className={`rounded-2xl border p-8 text-center ${
        isPass
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      {/* Icon */}
      <div className="text-5xl mb-4">{isPass ? "🎉" : "⚠️"}</div>

      {/* Result */}
      <h2
        className={`text-4xl font-semibold mb-2 ${
          isPass ? "text-green-600" : "text-red-500"
        }`}
      >
        {result.prediction}
      </h2>

      {/* Confidence */}
      <p className="text-sm text-gray-500 mb-4">
        Confidence: {result.confidence}%
      </p>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6 max-w-xs mx-auto">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            isPass ? "bg-green-500" : "bg-red-400"
          }`}
          style={{ width: `${result.confidence}%` }}
        />
      </div>

      {/* Message */}
      <p
        className={`text-sm mb-8 max-w-sm mx-auto ${
          isPass ? "text-green-700" : "text-red-600"
        }`}
      >
        {isPass
          ? "Great work! Keep up your current study routine and attendance to maintain this result."
          : "You are at academic risk. Consider increasing your study hours and attendance immediately."}
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Link
          to="/chatbot"
          state={{
            prediction: result.prediction,
            confidence: result.confidence,
          }}
          className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Get AI advice →
        </Link>

        <button
          onClick={onReset}
          className="border border-gray-300 text-gray-700 text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Predict again
        </button>

        <Link
          to="/dashboard"
          className="border border-gray-300 text-gray-700 text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          View dashboard
        </Link>
      </div>
    </div>
  );
}

function PredictionForm() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/predict", form);

      setResult(res.data);

      // SUCCESS TOAST
      toast.success("Prediction complete!");

    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        "Prediction failed. Please check your inputs and try again.";

      setError(errorMessage);

      // ERROR TOAST
      toast.error("Prediction failed. Check your inputs.");

    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setForm(initialForm);
    setError("");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Predict your result
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Enter your academic data below to get an instant pass/fail
          prediction.
        </p>
      </div>

      {/* Result or Form */}
      {result ? (
        <ResultCard result={result} onReset={handleReset} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}

                  <span className="text-gray-400 font-normal ml-1">
                    ({f.tip})
                  </span>
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    min={f.min}
                    max={f.max}
                    step="0.1"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-16 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {f.suffix}
                  </span>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>

                  Analysing your data...
                </span>
              ) : (
                "Get prediction"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;