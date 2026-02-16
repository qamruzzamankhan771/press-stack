import { NextRequest, NextResponse } from 'next/server';
import { buildAndExportProject } from '@/lib/modules/finalizer';
import fs from 'fs';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    try {
        // Await the params
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        const zipPath = await buildAndExportProject(id);

        if (!fs.existsSync(zipPath)) {
            return NextResponse.json({ error: 'Export failed' }, { status: 500 });
        }

        const fileBuffer = fs.readFileSync(zipPath);

        // Clean up immediately after reading into buffer
        // Note: buildAndExportProject already cleans up the build dir, but leaves the zip. 
        // We should clean up the zip too after serving it.
        fs.unlinkSync(zipPath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=press-stack-theme-${id}.zip`,
            },
        });
    } catch (error: any) {
        console.error('Export API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
