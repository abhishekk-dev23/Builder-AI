import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClockIcon, ArrowRightIcon, TrashIcon } from "lucide-react";
import moment from "moment";
import { useAppContext } from "../context/AppContext";
import PromptInput from "../components/PromptInput";
import { homeTags } from "../assets/assets";

const HomePage = () => {
    // Extracting user data and actions from context
    const {
        user,
        projects,
        loadingProjects,
        generatingProject,
        loadProjects,
        handleGenerate,
        handleDelete,
        logout,
    } = useAppContext();

    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    return (
        <div className="min-h-screen overflow-y-auto text-zinc-100 font-sans bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-5">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="logo" className="size-6" />
                    <span className="text-xl font-semibold tracking-tight">
                        Builder AI
                    </span>
                </div>

                <div className="flex items-center gap-5 text-sm font-medium text-zinc-300">
                    <span>{user?.name}</span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div className="flex-1 flex flex-col items-center justify-start pt-16 pb-12 px-4 text-center">
                <div className="w-full max-w-3xl flex flex-col items-center">
                    {/* Promo Badge */}
                    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-bold uppercase tracking-wider text-white">
                            Promo
                        </span>
                        <span className="text-sm text-zinc-300">
                            Create your first project for free
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-semibold text-white tracking-tight mb-6">
                        Let's build your app together
                    </h1>

                    <p className="text-lg text-zinc-400 mb-10 max-w-xl">
                        Describe what you want to build, and our AI will
                        generate a complete React application in seconds.
                    </p>

                    {/* Prompt Input with glassmorphic variant */}
                    <div className="w-full mt-6">
                        <PromptInput
                            onSubmit={handleGenerate}
                            loading={generatingProject}
                            placeholder="Create a portfolio website..."
                            variant="glass"
                            autoFocus={true}
                        />
                    </div>

                    {/* Scrolling Markup Tags */}
                    <div className="w-full overflow-hidden mt-10 relative select-none">
                        <div className="flex animate-marquee gap-3 whitespace-nowrap px-4 w-max">
                            {homeTags.map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleGenerate(tag)}
                                    disabled={generatingProject}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-zinc-300 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* All Projects */}
                    {!loadingProjects && projects.length > 0 && (
                        <div className="mt-16 w-full max-w-4xl text-left">
                            <div className="flex items-center gap-3 mb-6 px-4">
                                <p className="text-xl font-medium text-white">
                                    All Projects
                                </p>
                                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-medium text-zinc-300 border border-white/10">
                                    {projects.length}{" "}
                                    {projects.length === 1
                                        ? "Project"
                                        : "Projects"}
                                </span>
                            </div>

                            <div className="space-y-2 px-4 pb-12 custom-scrollbar">
                                {projects.map((p) => (
                                    <div
                                        key={p._id}
                                        onClick={() =>
                                            navigate(`/builder/${p._id}`)
                                        }
                                        className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-base font-medium text-white truncate mb-1.5">
                                                {p.name}
                                            </p>

                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1.5 text-zinc-400">
                                                    <ClockIcon size={10} />
                                                    {moment(
                                                        p.updatedAt ||
                                                            p.createdAt,
                                                    ).fromNow()}
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-medium border border-white/5">
                                                    v{p.version}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-indigo-500 rounded-lg transition-colors border border-transparent">
                                                <ArrowRightIcon size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(p._id);
                                                }}
                                                className="p-2 text-zinc-500 hover:text-white bg-white/5 hover:bg-red-500 rounded-lg transition-colors border border-transparent"
                                            >
                                                <TrashIcon size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
