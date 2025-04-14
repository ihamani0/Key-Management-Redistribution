import { useState } from "react";
import { EyeIcon, EyeOffIcon, Key, KeyRound, Unplug, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAuthError,
  loginUser,
  selectError,
} from "../features/auth/authSlice";
import Alert from "../ui/Alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const authError = useSelector(selectError); // Renamed for clarity

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Clear previous errors
    setLocalError("");
    dispatch(clearAuthError());

    if (!email || !password) {
      setLocalError("please fill all field");
      return;
    }
    const payload = {
      email,
      password,
    };

    dispatch(loginUser(payload));
  };

  return (
    <div className="flex items-center justify-center min-h-screen containerStyled">
      <div className="w-full max-w-md p-8 mx-4 space-y-8 bg-[#16202E] rounded-lg shadow-xl">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <KeyRound size={48} color="#fff" strokeWidth={1.5} />
            <span className="ml-2 text-xl font-semibold text-stone-100 font-outfit">
              KEY MANAGMENT
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold font-outfit text-stone-50">
          SIGN IN
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {localError && (
            <Alert variant="danger" title="Error">
              {localError}
            </Alert>
          )}

          {authError && (
            <Alert variant="danger" title="Error">
              {authError}
            </Alert>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError("");
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError("");
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-300"
            >
              Remember me
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-outfit cursor-pointer"
            >
              SIGN IN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
