import React, { useEffect } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";

const SandpackErrorMonitor = ({ onErrorChange }) => {
    const { sandpack } = useSandpack();
    const { error } = sandpack;

    useEffect(() => {
        if (error) {
            const message = error.message || "";
            const isNetworkError =
                message.includes("Failed to fetch") ||
                message.includes("csb.io") ||
                message.includes("ERR_CONNECTION_TIMED_OUT") ||
                message.includes("net::ERR_");

            if (isNetworkError) {
                onErrorChange(false);
                return;
            }
        }
        onErrorChange(true);
    }, [error, onErrorChange]);

    return null;
};

export default SandpackErrorMonitor;
