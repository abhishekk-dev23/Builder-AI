import { project } from "../models/project.js";
import { reviseProject } from "../services/ai.js";
import { applyOperations } from "../services/diff.js";

export function buildManifest(files) {
    const manifest = [];

    for (const [path, entry] of Object.entries(files || {})) {
        manifest.push({
            path,
            hash: entry.hash,
            size: entry.content ? entry.content.length : 0
        });
    }

    return manifest;
}

export async function chat(req, res) {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
    }

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const Project = await project.findOne({
        _id: req.params.id,
        owner: req.user.userId
    });

    if (!Project) {
        return res.status(404).json({ error: "Project not found" });
    }

    // Set status to revising and save user prompt immediately
    Project.status = "revising";
    Project.messages.push({
        role: "user",
        content: prompt,
        timestamp: new Date()
    });

    await Project.save();

    try {
        // Build compact manifest that contains path, hash, size instead of sending all code
        const manifest = buildManifest(Project.files);

        // Include all files contents so that AI can do accurate search and replace
        const relevantFiles = {};
        for (const [path, entry] of Object.entries(Project.files || {})) {
            relevantFiles[path] = entry.content;
        }

        // Recent messages for context (last 4 maximum)
        const recentMessages = Project.messages
            .slice(-4)
            .map((m) => ({
                role: m.role,
                content: m.content
            }));

        console.log(`Sending revision request for project ${Project._id}...`);

        // Call AI with manifest + relevant files
        const result = await reviseProject(prompt, manifest, relevantFiles, recentMessages);

        console.log(`AI got result: ${result.operations ? result.operations.length : 0} operations, ${result.description}`);

        // Apply operations to file map
        const { updatedFiles, errors } = applyOperations(Project.files || {}, result.operations || []);

        if (errors.length > 0) {
            console.warn("Some operations failed:", errors);
        }

        // Update project in database
        Project.files = updatedFiles;
        Project.markModified("files");
        Project.version += 1;
        Project.status = "completed";
        Project.messages.push({
            role: "assistant",
            content: `${result.description}${errors.length > 0 ? " (some operations failed)" : ""}`,
            timestamp: new Date()
        });

        await Project.save();

        // Return updated project
        const filesObject = {};
        for (const [path, entry] of Object.entries(Project.files || {})) {
            filesObject[path] = entry.content;
        }

        return res.json({
            _id: Project._id,
            name: Project.name,
            description: Project.description,
            files: filesObject,
            messages: Project.messages,
            version: Project.version,
            status: Project.status,
            appliedErrors: errors,
            aiDescription: result.description
        });
    } catch (error) {
        console.error("Revision error:", error);

        Project.status = "completed";
        await Project.save();

        return res.status(500).json({
            error: error.message || "Failed to process revision request"
        });
    }
}