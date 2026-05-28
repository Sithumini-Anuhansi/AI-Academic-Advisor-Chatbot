import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [token, setToken]   = useState(localStorage.getItem("token"));
  const navigate            = useNavigate();
  const location            = useLocation();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
        >
          AI Academic Advisor
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/predict"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Predict
              </Link>
              <Link
                to="/chatbot"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Chatbot
              </Link>
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;