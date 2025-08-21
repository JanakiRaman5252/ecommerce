import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSignup from "../hooks/useSignup";

export default function Signup() {
  const navigate = useNavigate();
  const signupMutation = useSignup();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signupMutation.mutateAsync(form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {typeof error === "object" ? JSON.stringify(error) : error}
          </p>
        )}

        {["username","email","first_name","last_name","phone_number","password","password2"].map((field) => (
          <input
            key={field}
            name={field}
            type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
            placeholder={field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
            required={["username","email","password","password2"].includes(field)}
          />
        ))}

        <button
          type="submit"
          disabled={signupMutation.isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {signupMutation.isLoading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="mt-3 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
