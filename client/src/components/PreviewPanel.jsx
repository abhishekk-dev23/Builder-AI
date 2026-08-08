import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    useSandpack,
} from "@codesandbox/sandpack-react";
import { detectDependencies } from "../utils/sandpackUtils";
import { useAppContext } from "../context/AppContext";
import SandpackErrorMonitor from "./SandpackErrorMonitor";

// Watches for files edits inside sandpack editor and save changes to DB and live state
function SandpackFileWatcher({ onLiveFilesChange }) {
    const { sandpack } = useSandpack();
    const { files } = sandpack;

    const { activeProject, updateProjectFiles } = useAppContext();
    const activeProjectRef = useRef(activeProject);

    useEffect(() => {
        activeProjectRef.current = activeProject;
    }, []);

    useEffect(() => {
        const project = activeProjectRef.current;
        if (!project) return;

        const updatedFiles = {};
        let hasChanges = false;

        for (const [path, fileObject] of Object.entries(files)) {
            const fileCode = fileObject.code;
            updatedFiles[path] = fileCode;

            const originalContent =
                typeof project.files[path] === "string"
                    ? project.files[path]
                    : project.files[path]?.content;

            if (originalContent !== undefined && originalContent !== fileCode) {
                hasChanges = true;
            }
        }

        // Sync live files to parent
        onLiveFilesChange(updatedFiles);

        if (hasChanges) {
            updateProjectFiles(updatedFiles);
        }
    }, []);

    return null;
}

const PreviewPanel = ({ project, activeFile, showCode }) => {
    const [showErrorOverlay, setshowErrorOverlay] = useState(true);

    // Keep local state of files that updates as user types
    const [liveFiles, setLiveFiles] = useState(project.files);

    const currentKey = `${project._id}-${project.version}`;
    const [previousProjectKey, setPreviousProjectKey] = useState(currentKey);

    if (previousProjectKey !== currentKey) {
        setPreviousProjectKey(currentKey);
        setLiveFiles(project.files);
    }

    // Convert live files to sandpack format
    const sandpackFiles = useMemo(() => {
        const spFiles = {};
        for (const [path, content] of Object.entries(liveFiles)) {
            const fileCode =
                typeof content === "string" ? content : content.content || "";
            spFiles[path] = {
                code: fileCode,
                active: path === activeFile,
            };
        }
        return spFiles;
    }, [liveFiles, activeFile]);

    // Detect dependencies from import statements using live files
    const dependencies = useMemo(() => {
        return detectDependencies(liveFiles);
    }, [liveFiles]);

    return (
        <div className="w-full h-full">
            <SandpackProvider
                key={project._id}
                template="react"
                files={sandpackFiles}
                customSetup={{
                    dependencies,
                }}
                options={{
                    externalResources: [
                        "https://cdn.tailwindcss.com",
                        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                    ],
                    classes: {
                        "sp-wrapper": "sp-wrapper",
                        "sp-layout": "sp-layout",
                        "sp-preview": "sp-preview",
                    },
                    logLabel: 0,
                }}
                theme={{
                    colors: {
                        surface1: "#ffffff",
                        surface2: "#f4f4f5",
                        surface3: "#e4e4e7",
                        clickable: "#71717a",
                        base: "#27272a",
                        disabled: "#a1a1aa",
                        hover: "#18181b",
                        accent: "#6366f1",
                        error: "#ef4444",
                        errorSurface: "#fef2f2",
                    },
                    font: {
                        body: "Inter, system-ui, sans-serif",
                        mono: '"Fira Code", monospace',
                        size: "13px",
                        lineHeight: "20px",
                    },
                }}
            >
                <SandpackFileWatcher onLiveFilesChange={setLiveFiles} />
                <SandpackErrorMonitor onErrorChange={setshowErrorOverlay} />
                
                <SandpackLayout className="w-full h-full border-none bg-transparent">
                    {showCode && (
                        <div className="flex-1 h-full border-r border-zinc-200">
                            <SandpackCodeEditor
                                showTabs={false}
                                showRunButton={false}
                                className="h-full"
                            />
                        </div>
                    )}
                    <div
                        className={`h-full ${
                            showCode ? "flex-1" : "w-full"
                        }`}
                    >
                        <SandpackPreview
                            showNavigator={true}
                            showRefreshButton={true}
                            showOpenInCodeSandbox={false}
                            showSandpackErrorOverlay={showErrorOverlay}
                            className="h-full w-full"
                        />
                    </div>
                </SandpackLayout>
            </SandpackProvider>
        </div>
    );
};

export default PreviewPanel;