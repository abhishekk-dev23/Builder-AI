import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, FolderTree } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";

import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import BuilderHeader from "../components/BuilderHeader";
import ChatPanel from "../components/ChatPanel";
import FileExplorer from "../components/FileExplorer";
import PreviewPanel from "../components/PreviewPanel";
import AgentProgressDashboard from "../components/AgentProgressDashboard";
import PublishModal from "../components/PublishModal";

const BuilderPage = () => {
    const {
        activeProject,
        setActiveProject,
        loadingActiveProject,
        activeFile,
        showCode,
        setActiveFile,
        setShowCode,
        loadProject,
        logout,
        handleChat,
        chatLoading,
    } = useAppContext();

    const { id } = useParams();
    const navigate = useNavigate();

    const [leftTab, setLeftTab] = useState("chat");
    const [publishing, setPublishing] = useState(false);
    const [publishUrl, setPublishUrl] = useState(null);

    useEffect(() => {
        if (!id) return;
        loadProject(id);
    }, [id]);

    useEffect(() => {
        if (!id || !activeProject) return;

        if (
            activeProject.status === "pending" ||
            activeProject.status === "generating" ||
            activeProject.status === "revising"
        ) {
            const interval = setInterval(() => {
                loadProject(id, true);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [id, activeProject]);

    if (loadingActiveProject || !activeProject) {
        return <Loading />;
    }

    const handleOpenPreview = () => {
        if (!id) return;
        window.open(`/preview/${id}`, "_blank");
    };

    const handlePublish = async () => {
        setPublishing(true);
        try {
            await API.post(`/api/projects/${id}/publish`);
            const url = `${window.location.origin}/publish/${id}`;
            setPublishUrl(url);
        } catch (error) {
            console.error("Publish error:", error);
            toast.error(
                error.response?.data?.error || "Failed to publish project",
            );
        } finally {
            setPublishing(false);
        }
    };

    const handleDownload = async () => {
        try {
            const JSZip = (await import("jszip")).default;
            const { saveAs } = await import("file-saver");
            const zip = new JSZip();

            for (const [path, fileObject] of Object.entries(
                activeProject.files,
            )) {
                const content =
                    typeof fileObject === "string"
                        ? fileObject
                        : fileObject.content;

                // Remove leading slash if it exists
                const safePath = path.startsWith("/")
                    ? path.substring(1)
                    : path;
                zip.file(safePath, content);
            }

            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(
                blob,
                `${activeProject.name.replace(/\s+/g, "-").toLowerCase()}.zip`,
            );
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download files");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white text-zinc-900 relative">
            {/* Top bar or header */}
            <BuilderHeader
                projectName={activeProject.name}
                version={activeProject.version}
                showCode={showCode}
                publishing={publishing}
                onToggleShowCode={() => setShowCode(!showCode)}
                onOpenPreview={handleOpenPreview}
                onPublish={handlePublish}
                onDownload={handleDownload}
                onBack={() => {
                    setActiveProject(null);
                    navigate("/");
                }}
                onLogout={logout}
            />

            {/* Main layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar */}
                <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
                    {/* Sidebar tabs */}
                    <div className="flex border-b border-zinc-200">
                        <button
                            onClick={() => setLeftTab("chat")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                leftTab === "chat"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                            }`}
                        >
                            <MessageSquare size={16} />
                            Chat
                        </button>
                        <button
                            onClick={() => setLeftTab("files")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                leftTab === "files"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                            }`}
                        >
                            <FolderTree size={16} />
                            Files
                        </button>
                    </div>

                    {/* Sidebar content */}
                    <div className="flex-1 overflow-hidden">
                        {leftTab === "chat" ? (
                            <ChatPanel
                                messages={activeProject.messages || []}
                                onSend={handleChat}
                                loading={chatLoading}
                            />
                        ) : (
                            <FileExplorer
                                files={activeProject.files || {}}
                                activeFile={activeFile}
                                onFileSelect={(path) => {
                                    setActiveFile(path);
                                    setShowCode(true);
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Preview or code area */}
                <div className="flex-1 bg-zinc-50 overflow-hidden">
                    {activeProject.status === "completed" ? (
                        <PreviewPanel
                            project={activeProject}
                            activeFile={activeFile}
                            showCode={showCode}
                        />
                    ) : (
                        <AgentProgressDashboard project={activeProject} />
                    )}
                </div>
            </div>

            {/* Publish Modal */}
            {publishUrl && (
                <PublishModal
                    publishUrl={publishUrl}
                    onClose={() => setPublishUrl(null)}
                />
            )}
        </div>
    );
};

export default BuilderPage;
