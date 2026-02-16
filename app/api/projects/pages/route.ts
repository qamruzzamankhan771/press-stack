import { NextResponse } from 'next/server';
import { savePageToProject } from '@/lib/modules/pages/pageManager';

export async function POST(req: Request) {
    try {
        const params = await req.json();
        const result = await savePageToProject(params);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
