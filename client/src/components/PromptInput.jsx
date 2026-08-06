import React, { useState, useRef, useEffect } from "react";
import {
    CloudUpload as CloudUploadIcon,
    Mic as MicIcon,
    ArrowRight as ArrowRightIcon,
    Loader2 as Loader2Icon,
} from "lucide-react";

const PromptInput = ({
    onSubmit = () => {},
    loading = false,
    placeholder = "",
    large = false,
    autoFocus = false,
    variant = "default",
}) => {
    const [value, setValue] = useState("");
    const textAreaRef = useRef(null);

    const handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }
        const trimmed = value.trim();
        if (!trimmed || loading) return;

        onSubmit(trimmed);
        setValue("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    useEffect(() => {
        if (autoFocus && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [autoFocus]);

    if (variant === "glass") {
        return (
            <form
                onSubmit={handleSubmit}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl"
            >
                <textarea
                    ref={textAreaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={loading}
                    rows={3}
                    className="w-full bg-transparent text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between mt-2">
                    <label
                        htmlFor="file"
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                    >
                        <input type="file" id="file" hidden />
                        <CloudUploadIcon size={18} />
                    </label>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <MicIcon size={18} />
                        </button>

                        <button
                            type="submit"
                            disabled={!value.trim() || loading}
                            className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <Loader2Icon
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <ArrowRightIcon size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    return (
        <div
            className={`flex items-center gap-2 bg-white border border-zinc-200 rounded-xl shadow-sm focus-within:border-zinc-300 focus-within:shadow-md transition-all ${
                large ? "p-4" : "p-3"
            }`}
        >
            <textarea
                ref={textAreaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={loading}
                rows={large ? 5 : 1}
                className={`w-full bg-transparent text-zinc-900 placeholder-zinc-400 focus:outline-none resize-none ${
                    large ? "text-base" : "text-sm"
                }`}
            />

            <button
                onClick={handleSubmit}
                disabled={!value.trim() || loading}
                className="flex shrink-0 items-center justify-center bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                    width: large ? 36 : 24,
                    height: large ? 36 : 24,
                }}
            >
                {loading ? (
                    <Loader2Icon
                        size={large ? 20 : 15}
                        className="animate-spin"
                    />
                ) : (
                    <ArrowRightIcon size={large ? 20 : 15} />
                )}
            </button>
        </div>
    );
};

export default PromptInput;
