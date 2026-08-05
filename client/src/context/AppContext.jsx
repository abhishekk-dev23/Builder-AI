import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
    const navigate = useNavigate();

    // Auth States
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // Auth Actions
    const checkSession = async () => {
        try {
            const { data } = await API.get("/api/auth/me");
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await API.post("/api/auth/login", {
                email,
                password,
            });
            setUser(data.user);
            toast.success("Welcome back");
            navigate("/");
        } catch (error) {
            console.error("Login failed", error);
            const errorMessage =
                error.response?.data?.error || "Invalid email or password";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await API.post("/api/auth/register", {
                name,
                email,
                password,
            });
            setUser(data.user);
            toast.success("Account created successfully");
            navigate("/");
        } catch (error) {
            console.error("Registration failed", error);
            const errorMessage = error.response?.data?.error || "Registration failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return (
        <AppContext.Provider
            value={{
                user,
                loadingUser,
                login,
                register,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error(
            "useAppContext must be used within an AppContextProvider",
        );
    }
    return context;
}
