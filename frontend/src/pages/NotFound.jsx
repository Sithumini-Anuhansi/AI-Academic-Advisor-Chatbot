import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-semibold text-indigo-600 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;