import { NextRequest, NextResponse } from 'next/server';
import { generateZip } from '@/lib/zipGenerator';

export async function POST(req: NextRequest) {
    try {
        const { php, acf, templateName } = await req.json();

        if (!php || !acf) {
            return NextResponse.json({ success: false, error: 'Missing content for ZIP' }, { status: 400 });
        }

        const safeTemplateName = templateName || 'generated-template';
        const zipBuffer = await generateZip(php, acf, safeTemplateName);

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename=${safeTemplateName}.zip`,
            },
        });
    } catch (error) {
        console.error('Download Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate ZIP' }, { status: 500 });
    }
}
