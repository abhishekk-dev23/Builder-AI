import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import API from "../api/api";
import Loading from "../components/Loading";
import FullPagePreview from "../components/FullPagePreview";

const PublishPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchPublicProject = async () => {
            try {
                const { data } = await API.get(`/api/projects/public/${id}`);
                setProject(data);
            } catch (error) {
                console.error(error);
                setError(
                    error.response?.data?.error ||
                        "This project is unavailable or does not exist.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProject();
    }, [id]);

    if (loading) {
        return <Loading />;
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
                <div className="size-12 bg-red-100 text-red-600 flex items-center justify-center rounded-xl mb-4">
                    <AlertCircle size={24} />
                </div>
                <h1 className="text-xl font-semibold text-zinc-900 mb-2">
                    Website Unavailable
                </h1>
                <p className="text-sm text-zinc-500 mb-8 max-w-sm text-center">
                    {error ||
                        "This project does not exist or has not been published yet."}
                </p>
                <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
                    <img
                        src="/logo.svg"
                        alt="logo"
                        className="size-5 opacity-50 grayscale"
                    />
                    Builder AI
                </div>
            </div>
        );
    }

    return <FullPagePreview files={project.files} />;
};

export default PublishPage;
