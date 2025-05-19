import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to the dashboard
      navigate("/dashboard");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white border-2 border-main shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-main text-center">
          Admin Login
        </h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-3 mb-4 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-main font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-main rounded px-3 py-2 focus:outline-none focus:ring focus:ring-main"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-main font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-main rounded px-3 py-2 focus:outline-none focus:ring focus:ring-main"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-main border-main text-text font-medium py-2 rounded-lg hover:bg-red-700 hover:text-text transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
