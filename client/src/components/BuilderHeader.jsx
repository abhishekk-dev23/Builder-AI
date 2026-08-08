import React from "react";
import {
    ArrowLeft as ArrowLeftIcon,
    Code2 as Code2Icon,
    Download as DownloadIcon,
    ExternalLink as ExternalLinkIcon,
    Eye as EyeIcon,
    Globe as GlobeIcon,
    Loader2 as Loader2Icon,
} from "lucide-react";

const BuilderHeader = ({
    projectName,
    version,
    showCode,
    publishing,
    onToggleShowCode,
    onOpenPreview,
    onPublish,
    onDownload,
    onBack,
    onLogout,
}) => {
    return (
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 bg-white">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                >
                    <ArrowLeftIcon size={16} />
                </button>

                <div className="flex items-center gap-2">
                    <img
                        src="/logo.svg"
                        alt="logo"
                        className="size-5 invert"
                    />
                    <span className="text-sm font-medium text-zinc-900">
                        {projectName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-medium text-zinc-500">
                        v{version}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={onToggleShowCode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        showCode
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                >
                    {showCode ? (
                        <>
                            <EyeIcon size={13} />
                            Preview
                        </>
                    ) : (
                        <>
                            <Code2Icon size={13} />
                            Code
                        </>
                    )}
                </button>

                <button
                    onClick={onOpenPreview}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                    <ExternalLinkIcon size={13} />
                    Open Preview
                </button>

                <button
                    onClick={onPublish}
                    disabled={publishing}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {publishing ? (
                        <Loader2Icon size={13} className="animate-spin" />
                    ) : (
                        <GlobeIcon size={13} />
                    )}
                    Publish
                </button>

                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                    <DownloadIcon size={13} />
                    Export
                </button>

                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ml-2"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
};

export default BuilderHeader;