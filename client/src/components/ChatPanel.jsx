import React, { useEffect, useRef } from "react";
import { User, BotMessageSquare } from "lucide-react";
import PromptInput from "./PromptInput";

const ChatPanel = ({ messages, onSend, loading }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                        <p className="text-sm">Ask AI to modify your website</p>
                    </div>
                )}

                {messages.map((message, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div
                            className={`shrink-0 size-8 flex items-center justify-center rounded-lg ${
                                message.role === "user"
                                    ? "bg-zinc-100"
                                    : "bg-indigo-50"
                            }`}
                        >
                            {message.role === "user" ? (
                                <User size={14} className="text-zinc-500" />
                            ) : (
                                <BotMessageSquare
                                    size={14}
                                    className="text-indigo-500"
                                />
                            )}
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            <p className="text-xs font-medium text-zinc-500 mb-1">
                                {message.role === "user" ? "You" : "AI"}
                            </p>
                            <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                {message.content}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-2.5 items-start">
                        <div className="shrink-0 size-8 flex items-center justify-center rounded-lg bg-zinc-100">
                            <BotMessageSquare
                                size={14}
                                className="text-zinc-900"
                            />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <p className="text-xs font-medium text-zinc-500 mb-1">
                                AI
                            </p>
                            <div className="flex items-center gap-1 h-5">
                                <span className="dot-loader"></span>
                                <span className="dot-loader"></span>
                                <span className="dot-loader"></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-zinc-200">
                <PromptInput
                    onSubmit={onSend}
                    loading={loading}
                    placeholder="Ask AI to modify..."
                    autoFocus={true}
                />
            </div>
        </div>
    );
};

export default ChatPanel;
