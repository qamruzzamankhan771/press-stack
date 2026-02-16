import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR, WP_THEME_FOLDERS, WP_CORE_FILES } from './config';

export interface ProjectState {
    id: string;
    name: string;
    type: string;
    plugins: string[];
    createdAt: number;
    updatedAt: number;
    pages: {
        id: string;
        name: string;
        slug: string;
        templateType: 'full-page' | 'section';
        template: string; // Dynamic path like 'templates/page-home.php'
        assetDependencies: string[];
        createdAt: number;
        updatedAt: number;
    }[];
    schemaVersion: number;
}

export const ensureProjectsDir = () => {
    if (!fs.existsSync(PROJECTS_DIR)) {
        fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    }
};

export const getProjects = (): ProjectState[] => {
    ensureProjectsDir();
    const dirs = fs.readdirSync(PROJECTS_DIR);
    return dirs
        .map((dir: string) => {
            const configPath = path.join(PROJECTS_DIR, dir, 'project.json');
            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            }
            return null;
        })
        .filter(Boolean);
};

export const getProject = (id: string): ProjectState | null => {
    const configPath = path.join(PROJECTS_DIR, id, 'project.json');
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return null;
};

export const createProject = (name: string, type: string): ProjectState => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const projectPath = path.join(PROJECTS_DIR, id);

    if (fs.existsSync(projectPath)) {
        throw new Error(`Project with id "${id}" already exists.`);
    }

    const project: ProjectState = {
        id,
        name,
        type,
        plugins: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pages: [],
        schemaVersion: 1
    };

    // 1. Create Base Project Dir
    fs.mkdirSync(projectPath, { recursive: true });

    // 2. Create WP Structure
    WP_THEME_FOLDERS.forEach(folder => {
        fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    });

    // 3. Create Core Files
    WP_CORE_FILES.forEach(file => {
        const filePath = path.join(projectPath, file.path);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, file.content);
        }
    });

    // 4. Save Config
    fs.writeFileSync(
        path.join(projectPath, 'project.json'),
        JSON.stringify(project, null, 2)
    );

    return project;
};

export const updateProject = (project: ProjectState): void => {
    const projectPath = path.join(PROJECTS_DIR, project.id);
    project.updatedAt = Date.now();

    fs.writeFileSync(
        path.join(projectPath, 'project.json'),
        JSON.stringify(project, null, 2)
    );
};
