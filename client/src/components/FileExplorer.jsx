import React, { useMemo } from "react";
import { FolderOpen, FileText, FileCode } from "lucide-react";

function getFileIcon(name) {
    if (name.endsWith(".css")) {
        return <FileText size={14} className="text-sky-500" />;
    }
    if (name.endsWith(".jsx") || name.endsWith(".js")) {
        return <FileCode size={14} className="text-yellow-500" />;
    }
    if (name.endsWith(".json")) {
        return <FileText size={14} className="text-green-500" />;
    }
    return <FileText size={14} className="text-zinc-400" />;
}

function buildTree(paths) {
    const root = [];

    for (const filePath of paths.sort()) {
        const parts = filePath.split("/").filter(Boolean);
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];
            const isLast = i === parts.length - 1;
            const fullPath = "/" + parts.slice(0, i + 1).join("/");

            let existing = current.find((n) => n.name === name);

            if (!existing) {
                existing = {
                    name,
                    path: fullPath,
                    isDirectory: !isLast,
                    children: [],
                };
                current.push(existing);
            }

            current = existing.children;
        }
    }

    return root;
}

function TreeItem({ node, activeFile, onFileSelect, depth = 0 }) {
    const isActive = node.path === activeFile;

    if (node.isDirectory) {
        return (
            <div>
                <div
                    className="flex items-center gap-2 py-1.5 pr-3 text-sm text-zinc-700 font-medium"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    <FolderOpen
                        size={14}
                        className="text-indigo-400 opacity-80"
                    />
                    <span className="truncate">{node.name}</span>
                </div>
                <div>
                    {node.children.map((child) => (
                        <TreeItem
                            key={child.path}
                            node={child}
                            activeFile={activeFile}
                            onFileSelect={onFileSelect}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => onFileSelect(node.path)}
            className={`w-full flex items-center gap-2 py-1.5 pr-3 text-sm transition-colors ${
                isActive
                    ? "bg-indigo-50/50 text-indigo-600 font-medium"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
        </button>
    );
}

const FileExplorer = ({ files, activeFile, onFileSelect }) => {
    const tree = useMemo(() => buildTree(Object.keys(files || {})), [files]);

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-zinc-200 shrink-0">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Files
                </p>
            </div>

            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {tree.map((node) => (
                    <TreeItem
                        key={node.path}
                        node={node}
                        activeFile={activeFile}
                        onFileSelect={onFileSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileExplorer;
