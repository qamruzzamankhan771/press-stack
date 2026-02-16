import { NextResponse } from 'next/server';
import { getProjects, createProject, getProject, updateProject } from '@/lib/projectStore';

export async function GET() {
    try {
        const projects = getProjects();
        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, type } = await req.json();
        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }
        const project = createProject(name, type);
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const project = await req.json();
        if (!project.id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }
        updateProject(project);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
