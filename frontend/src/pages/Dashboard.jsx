import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import API from "../api/axios";

const COLORS = { PASS: "#16a34a", FAIL: "#dc2626" };

/* Skeleton loader component */
function Skeleton({ className }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
    />
  );
}

function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [histRes, analyticsRes] = await Promise.all([
          API.get("/predictions/history"),
          API.get("/predictions/analytics"),
        ]);

        setPredictions(histRes.data.predictions);
        setAnalytics(analyticsRes.data.analytics);
      } catch (err) {
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const passCount =
    predictions.filter((p) => p.prediction === "PASS").length;

  const failCount =
    predictions.filter((p) => p.prediction === "FAIL").length;

  const latest = predictions[0] || null;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const pieData = [
    { name: "Pass", value: passCount },
    { name: "Fail", value: failCount },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your academic prediction history and performance overview
          </p>
        </div>

        <Link
          to="/predict"
          className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          + New prediction
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">
            Total predictions
          </p>

          <p className="text-3xl font-semibold text-gray-900">
            {predictions.length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">
            Predicted pass
          </p>

          <p className="text-3xl font-semibold text-green-600">
            {passCount}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">
            Predicted fail
          </p>

          <p className="text-3xl font-semibold text-red-500">
            {failCount}
          </p>
        </div>
      </div>

      {/* Latest result banner */}
      {latest && (
        <div
          className={`rounded-xl p-5 mb-8 border ${
            latest.prediction === "PASS"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Latest prediction
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4">

            <div>
              <span
                className={`text-2xl font-semibold ${
                  latest.prediction === "PASS"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {latest.prediction}
              </span>

              <span className="text-sm text-gray-500 ml-3">
                {latest.confidence}% confidence ·{" "}
                {formatDate(latest.created_at)}
              </span>
            </div>

            <Link
              to="/chatbot"
              state={{
                prediction: latest.prediction,
                confidence: latest.confidence,
              }}
              className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700"
            >
              Get advice →
            </Link>

          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">

            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Pass vs fail
            </h2>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Pass"
                          ? COLORS.PASS
                          : COLORS.FAIL
                      }
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(v) => [v, "Predictions"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">

            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Average input scores
            </h2>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={analytics.subject_data}
                margin={{
                  top: 0,
                  right: 0,
                  left: -20,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11 }}
                />

                <YAxis tick={{ fontSize: 11 }} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* Line Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:col-span-2">

            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Confidence trend over time
            </h2>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={analytics.trend}
                margin={{
                  top: 0,
                  right: 16,
                  left: -20,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip
                  formatter={(v) => [v + "%", "Confidence"]}
                />

                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>

        </div>
      )}

      {/* Prediction history table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Prediction history
          </h2>
        </div>

        {/* Skeleton Loader */}
        {loading && (
          <div className="p-5 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && predictions.length === 0 && (
          <div className="px-5 py-16 text-center">

            <p className="text-gray-400 text-sm mb-4">
              No predictions yet
            </p>

            <Link
              to="/predict"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Make your first prediction
            </Link>

          </div>
        )}

        {/* Table */}
        {!loading && !error && predictions.length > 0 && (
          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Attendance
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Test 1
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Test 2
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Assignment
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Study hrs
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Result
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Confidence
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {predictions.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition"
                >

                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(p.created_at)}
                  </td>

                  <td className="px-5 py-3 text-gray-700">
                    {p.attendance}%
                  </td>

                  <td className="px-5 py-3 text-gray-700">
                    {p.test1}/40
                  </td>

                  <td className="px-5 py-3 text-gray-700">
                    {p.test2}/40
                  </td>

                  <td className="px-5 py-3 text-gray-700">
                    {p.assignment}/10
                  </td>

                  <td className="px-5 py-3 text-gray-700">
                    {p.study_hours}h
                  </td>

                  <td className="px-5 py-3">

                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.prediction === "PASS"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.prediction}
                    </span>

                  </td>

                  <td className="px-5 py-3 text-gray-500">
                    {p.confidence}%
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default Dashboard;