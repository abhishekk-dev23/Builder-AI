import React, { useState, useMemo } from "react";
import {
    SandpackProvider,
    SandpackLayout,
    SandpackPreview,
} from "@codesandbox/sandpack-react";
import { detectDependencies } from "../utils/sandpackUtils";
import SandpackErrorMonitor from "./SandpackErrorMonitor";

const FullPagePreview = ({ files }) => {
    const [showErrorOverlay, setShowErrorOverlay] = useState(true);

    const sandpackFiles = useMemo(() => {
        if (!files) return {};
        const spFiles = {};
        for (const [path, content] of Object.entries(files)) {
            spFiles[path] = {
                code:
                    typeof content === "string"
                        ? content
                        : content.content || "",
            };
        }
        return spFiles;
    }, [files]);

    const dependencies = useMemo(() => {
        if (!files) return {};
        return detectDependencies(files);
    }, [files]);

    return (
        <div className="h-screen w-screen bg-white overflow-hidden">
            <SandpackProvider
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
                    logLabel: 0,
                }}
            >
                <SandpackErrorMonitor onErrorChange={setShowErrorOverlay} />
                <SandpackLayout className="w-full h-full border-none bg-transparent">
                    <SandpackPreview
                        showNavigator={false}
                        showRefreshButton={false}
                        showOpenInCodeSandbox={false}
                        showErrorOverlay={showErrorOverlay}
                        className="h-full w-full"
                    />
                </SandpackLayout>
            </SandpackProvider>
        </div>
    );
};

export default FullPagePreview;
