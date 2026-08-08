import React from "react";
import { X as XIcon } from "lucide-react";
import toast from "react-hot-toast";

const PublishModal = ({ publishUrl, onClose }) => {
    const handleCopyLink = () => {
        if (!publishUrl) return;
        navigator.clipboard.writeText(publishUrl);
        toast.success("Public link copied to clipboard");
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white border border-zinc-200 shadow-xl rounded-xl relative p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors"
                >
                    <XIcon size={16} />
                </button>

                <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                        Your website is live
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 mb-5">
                        Anyone with this link can view your published website.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                            Published Link
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={publishUrl}
                            className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-600 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium rounded-lg transition-colors"
                        >
                            Copy Link
                        </button>
                        <button
                            onClick={() => window.open(publishUrl, "_blank")}
                            className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Open Site
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublishModal;
