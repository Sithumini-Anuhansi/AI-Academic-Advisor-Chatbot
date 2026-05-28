import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [token, setToken]     = useState(localStorage.getItem("token"));
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate              = useNavigate();
  const location              = useLocation();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setMenuOpen(false);
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-semibold text-indigo-600">
          AI Academic Advisor
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-5 text-sm">
          {token ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition">Dashboard</Link>
              <Link to="/predict"   className="text-gray-600 hover:text-gray-900 transition">Predict</Link>
              <Link to="/chatbot"   className="text-gray-600 hover:text-gray-900 transition">Chatbot</Link>
              <button onClick={logout} className="text-red-500 hover:text-red-600 transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm">
          {token ? (
            <>
              <Link to="/dashboard" className="text-gray-700">Dashboard</Link>
              <Link to="/predict"   className="text-gray-700">Predict</Link>
              <Link to="/chatbot"   className="text-gray-700">Chatbot</Link>
              <button onClick={logout} className="text-left text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="text-gray-700">Login</Link>
              <Link to="/register" className="text-gray-700">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;