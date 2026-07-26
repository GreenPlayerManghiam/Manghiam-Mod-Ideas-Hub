import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}) {
  const [mode, setMode] = useState("signin"); // signin | signup

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
          throw new Error("Please enter a username.");
        }

        if (!email.trim()) {
          throw new Error("Please enter your email.");
        }

        if (!password) {
          throw new Error("Please enter a password.");
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: trimmedUsername,
            },
          },
        });

        if (error) throw error;

        setSuccessMsg(
          "Account created successfully! If email confirmation is enabled, please verify your email before signing in."
        );

        resetForm();

        setTimeout(() => {
          setMode("signin");
        }, 1800);
      }

      if (mode === "signin") {
        if (!email.trim()) {
          throw new Error("Please enter your email.");
        }

        if (!password) {
          throw new Error("Please enter your password.");
        }

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        if (!data.session) {
          throw new Error("Unable to create session.");
        }

        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }

        resetForm();
        onClose();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        resetForm();
        onClose();
      }}
    >
      <div
        className="card relative w-full max-w-md p-6 bg-surface-raised border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-white">
            {mode === "signup"
              ? "Create ModHub Account"
              : "Sign In to ModHub"}
          </h3>

          <button
            className="text-gray-400 hover:text-white text-xl"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            {successMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {mode === "signup" && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Username
              </label>

              <input
                type="text"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="e.g. PixelGamer99"
                className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-surface-overlay py-2.5 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "signup"
                ? "Creating Account..."
                : "Signing In..."
              : mode === "signup"
              ? "Sign Up & Join"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-400">
          {mode === "signup" ? (
            <>
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode("signin");
                }}
                className="text-accent hover:underline font-medium ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account yet?
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode("signup");
                }}
                className="text-accent hover:underline font-medium ml-1 cursor-pointer"
              >
                Create one
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}