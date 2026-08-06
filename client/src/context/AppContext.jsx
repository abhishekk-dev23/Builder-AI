import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
    const navigate = useNavigate();

    // ==========================================
    // Auth States
    // ==========================================
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // ==========================================
    // Project States
    // ==========================================
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [activeProject, setActiveProject] = useState(null);
    const [loadingActiveProject, setLoadingActiveProject] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [generatingProject, setGeneratingProject] = useState(false);
    const [activeFile, setActiveFile] = useState("/app.js");
    const [showCode, setShowCode] = useState(false);

    // ==========================================
    // Auth Actions
    // ==========================================
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
            const errorMessage =
                error.response?.data?.error || "Registration failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            await API.post("/api/auth/logout");
            setUser(null);
            setProjects([]);
            setActiveProject(null);
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            console.error(error);
            toast.error("Logout failed");
        }
    };

    // ==========================================
    // Projects Actions
    // ==========================================
    const loadProjects = async () => {
        if (!user) return;
        try {
            const { data } = await API.get("/api/projects");
            setProjects(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load project list");
        } finally {
            setLoadingProjects(false);
        }
    };

    const loadProject = async (id, silent = false) => {
        if (!user) return;
        if (!silent) {
            setLoadingActiveProject(true);
        }
        try {
            const { data } = await API.get(`/api/projects/${id}`);
            setActiveProject(data);

            // Default file selection
            const ObjectFiles = Object.keys(data.files);
            if (ObjectFiles.length > 0) {
                setActiveFile((prev) => {
                    if (ObjectFiles.includes(prev)) {
                        return prev;
                    }
                    if (ObjectFiles.includes("/app.js")) {
                        return "/app.js";
                    }
                    return ObjectFiles[0];
                });
            }
        } catch (error) {
            console.error(error);
            if (!silent) {
                toast.error("Failed to load project");
                navigate("/");
            }
        } finally {
            if (!silent) {
                setLoadingActiveProject(false);
            }
        }
    };

    // Automatically poll active project status
    useEffect(() => {
        if (!activeProject?._id || !user) return;

        const isOngoing =
            activeProject.status === "generating" ||
            activeProject.status === "pending" ||
            activeProject.status === "revising";

        if (isOngoing) {
            setChatLoading(true);
            const interval = setInterval(() => {
                loadProject(activeProject._id, true);
            }, 2000);

            return () => clearInterval(interval);
        } else {
            setChatLoading(false);
        }
    }, [activeProject?._id, activeProject?.status, loadProject, user]);

    const handleGenerate = useCallback(
        async (prompt) => {
            if (!user) return;
            setGeneratingProject(true);
            try {
                const { data } = await API.post("/api/projects", { prompt });
                toast.success("AI agent is planning a structure");
                navigate(`/builder/${data._id}`);
            } catch (error) {
                console.error(error);
                toast.error("Failed to generate project");
            } finally {
                setGeneratingProject(false);
            }
        },
        [navigate, user],
    );

    const handleDelete = useCallback(
        async (id) => {
            if (!user) return;
            try {
                await API.delete(`/api/projects/${id}`);
                setProjects((prev) => prev.filter((p) => p._id !== id));
                toast.success("Project deleted successfully");
            } catch (error) {
                console.error("Failed to delete project", error);
                toast.error("Failed to delete project");
            }
        },
        [user],
    );

    return (
        <AppContext.Provider
            value={{
                user,
                loadingUser,
                login,
                register,
                projects,
                loadingProjects,
                activeProject,
                loadingActiveProject,
                chatLoading,
                generatingProject,
                activeFile,
                showCode,
                setActiveFile,
                setShowCode,
                loadProjects,
                loadProject,
                handleGenerate,
                handleDelete,
                logout,
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
