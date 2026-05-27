import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  const features = [
    {
      icon: "🎯",
      title: "Pass/Fail prediction",
      desc: "Enter your academic data and get an instant prediction powered by a trained ML model.",
    },
    {
      icon: "🤖",
      title: "AI academic advisor",
      desc: "Chat with an AI advisor that gives personalised study advice based on your results.",
    },
    {
      icon: "📊",
      title: "Performance dashboard",
      desc: "Track your prediction history and visualise your academic performance over time.",
    },
  ];

  const stats = [
    { value: "5", label: "Input factors" },
    { value: "ML", label: "Powered predictions" },
    { value: "24/7", label: "AI advisor access" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
          AI-powered academic support
        </span>
        <h1 className="text-5xl font-semibold text-gray-900 leading-tight mb-6">
          Know your academic risk{" "}
          <span className="text-indigo-600">before exams</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Enter your attendance, test scores, and study hours. Our ML model
          predicts your outcome and an AI advisor tells you exactly what to do next.
        </p>

        {!token && (
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Login
            </Link>
          </div>
        )}

        {token && (
          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Go to dashboard →
          </Link>
        )}
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center"
            >
              <p className="text-3xl font-semibold text-indigo-600 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
          Everything you need to stay on track
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-xl p-6 text-left"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 text-center px-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Ready to take control of your results?
        </h2>
        <p className="text-indigo-200 mb-8 max-w-md mx-auto">
          Sign up in seconds — no credit card needed.
        </p>
        {!token && (
          <Link
            to="/register"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            Create your account
          </Link>
        )}
        {token && (
          <Link
            to="/predict"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            Make a prediction →
          </Link>
        )}
      </section>

    </div>
  );
}

export default Home;