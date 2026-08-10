import { project } from "../models/project.js";
// import { generateProject } from "../services/ai.js";
import crypto from "crypto";

function hashContent(content) {
    return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

export async function createProject(req, res) {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
    }

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const Project = await project.create({
        name: "Planning project...",
        description: prompt,
        files: {},
        messages: [
            {
                role: "user",
                content: prompt,
            },
            {
                role: "assistant",
                content: "Planning project structure...",
            },
        ],
        version: 0,
        owner: req.user.userId,
        status: "pending",
        filesPlanned: [],
        filesGenerated: [],
        currentFile: null,
        error: null,
    });

    runBackgroundGeneration(Project._id.toString(), prompt).catch((error) => {
        console.error(
            `Background AI file generation error for project ${Project._id}:`,
            error,
        );
    });

    return res.status(201).json({
        _id: Project._id,
        name: Project.name,
        description: Project.description,
        files: {},
        messages: Project.messages,
        version: Project.version,
        status: Project.status,
        filesPlanned: Project.filesPlanned,
        filesGenerated: Project.filesGenerated,
        currentFile: Project.currentFile,
        error: Project.error,
        createdAt: Project.createdAt,
    });
}

async function runBackgroundGeneration(projectId, prompt) {
    try {
        console.log(
            `Background AI starting generation for project ${projectId}...`,
        );

        const result = await generateProject(prompt, {
            onPlan: async (plan) => {
                console.log("Planned files:", plan.files);

                const fileList = plan.files
                    .map((file) => `- ${file.path}: ${file.description}`)
                    .join("\n");

                await project.findByIdAndUpdate(projectId, {
                    name: plan.projectName || "Generated Project",
                    status: "generating",
                    filesPlanned: plan.files,
                    $push: {
                        messages: {
                            role: "assistant",
                            content: `Planned website structure:\n${fileList}`,
                            timestamp: new Date(),
                        },
                    },
                });
            },
            onFileStart: async (path) => {
                console.log(`Building file: ${path}`);
                await project.findByIdAndUpdate(projectId, {
                    currentFile: path,
                });
            },
            onFileComplete: async (path, code) => {
                console.log(`Completed file: ${path}`);

                const Project = await project.findById(projectId);

                if (Project) {
                    Project.files = Project.files || {};
                    Project.files[path] = {
                        content: code,
                        hash: hashContent(code),
                    };

                    Project.filesGenerated = [
                        ...(Project.filesGenerated || []),
                        path,
                    ];
                    Project.messages.push({
                        role: "assistant",
                        content: `Created file ${path}`,
                        timestamp: new Date(),
                    });

                    Project.currentFile = null;
                    Project.markModified("files");
                    await Project.save();
                }
            },
        });

        console.log(
            `Background AI successfully generated project ${projectId}`,
        );

        const Project = await project.findById(projectId);

        if (Project) {
            Project.status = "completed";
            Project.version = 1;

            if (result.description) {
                Project.name = result.description;
            }

            Project.messages.push({
                role: "assistant",
                content:
                    "Website generation complete! You can view and edit the files.",
                timestamp: new Date(),
            });

            await Project.save();
        }
    } catch (error) {
        console.error(
            `Background AI generation failed for project ${projectId}:`,
            error,
        );

        await project.findByIdAndUpdate(projectId, {
            status: "failed",
            error: error.message,
            $push: {
                messages: {
                    role: "assistant",
                    content: `Generation failed: ${error.message}`,
                    timestamp: new Date(),
                },
            },
        });
    }
}

export async function listProjects(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const projects = await project
        .find(
            { owner: req.user.userId },
            { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
        )
        .sort({ updatedAt: -1 });

    return res.json(projects);
}

export async function getProject(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const Project = await project.findOne({
        _id: req.params.id,
        owner: req.user.userId,
    });

    if (!Project) {
        return res.status(404).json({ error: "Project not found" });
    }

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
        filesPlanned: Project.filesPlanned,
        filesGenerated: Project.filesGenerated,
        currentFile: Project.currentFile,
        error: Project.error,
        createdAt: Project.createdAt,
        updatedAt: Project.updatedAt,
    });
}

export async function deleteProject(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await project.findOneAndDelete({
        _id: req.params.id,
        owner: req.user.userId,
    });

    if (!result) {
        return res.status(404).json({ error: "Project not found" });
    }

    return res.json({ success: true });
}

export async function updateProjectFiles(req, res) {
    const { files } = req.body;

    if (!files || typeof files !== "object") {
        return res.status(400).json({ error: "Files object is required" });
    }

    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const Project = await project.findOne({
        _id: req.params.id,
        owner: req.user.userId,
    });

    if (!Project) {
        return res.status(404).json({ error: "Project not found" });
    }

    const newFiles = {};

    for (const [path, content] of Object.entries(files)) {
        filesObj[path] = entry.content
    }

    Project.files = newFiles;
    await Project.save();

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
        createdAt: Project.createdAt,
        updatedAt: Project.updatedAt,
    });
}

export async function publishProject(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const Project = await project.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.user.userId,
        },
        {
            published: true,
        },
        {
            returnDocument: "after",
        },
    );

    if (!Project) {
        return res.status(404).json({ error: "Project not found" });
    }

    return res.json({
        success: true,
        published: Project.published,
    });
}

export async function getPublicProject(req, res) {
    const Project = await project.findById(req.params.id);

    if (!Project) {
        return res.status(404).json({ error: "Project not found" });
    }

    if (!Project.published) {
        return res.status(403).json({ error: "Project is not published yet" });
    }

    const filesObject = {};

    for (const [path, entry] of Object.entries(Project.files || {})) {
        filesObject[path] = entry.content;
    }

    return res.json({
        _id: Project._id,
        name: Project.name,
        description: Project.description,
        files: filesObject,
        version: Project.version,
    });
}
