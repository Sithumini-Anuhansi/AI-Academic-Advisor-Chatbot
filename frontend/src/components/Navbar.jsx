import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-semibold text-indigo-600">
          AI Academic Advisor
        </Link>
        <div className="flex gap-4 text-sm">
          {token ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/predict">Predict</Link>
              <Link to="/chatbot">Chatbot</Link>
              <button onClick={logout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;