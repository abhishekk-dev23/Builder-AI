import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import LoginLeft from "../components/LoginLeft";
import { useAppContext } from "../context/AppContext";

const AuthPage = ({ mode }) => {
    const isLogin = mode === "login";

    // Global context functions
    const { login, register } = useAppContext();
    const navigate = useNavigate();

    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // UI States
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "login") {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            navigate("/");
        } catch (err) {
            setError(err.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* left panel */}
            <LoginLeft />

            {/* right panel */}
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-zinc-900 mb-2 tracking-tight">
                            {isLogin ? "Sign In" : "Create an account"}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            {isLogin
                                ? "Enter your credentials to access your website builder."
                                : "Get started by entering your registration details."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-zinc-900 bg-transparent placeholder-zinc-300 pr-8"
                                    placeholder="*********"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon size={14} />
                                    ) : (
                                        <EyeIcon size={14} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-950 text-white flex items-center justify-center py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && (
                                <Loader2 className="animate-spin size-4 mr-2" />
                            )}
                            {isLogin ? "Sign In" : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-zinc-500 mt-8">
                        {isLogin ? (
                            <>
                                New to builder?{" "}
                                <Link
                                    to="/register"
                                    className="text-zinc-900 font-medium hover:underline"
                                >
                                    Create an account
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-zinc-900 font-medium hover:underline"
                                >
                                    Sign in here
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
