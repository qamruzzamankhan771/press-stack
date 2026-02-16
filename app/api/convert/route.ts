import { NextResponse } from 'next/server';
import { compileHTML } from '@/lib/compiler';

export async function POST(req: Request) {
    try {
        const { html, templateName, templateSlug, templateType, projectId } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML is required' }, { status: 400 });
        }

        // UNIFIED PIPELINE v3.3.2
        // Now uses TemplateKind determination for strict branching logic
        const result = compileHTML(
            html,
            templateName || 'Generated Template',
            templateSlug || 'generated-template',
            templateType || 'full-page',
            projectId
        );

        return NextResponse.json({
            php: result.php,
            acf: result.acf,
            model: result.model,
            reports: result.reports,
            optimizedHtml: result.optimizedHtml,
            assets: result.assets,
            headerExtracted: result.headerExtracted,
            footerExtracted: result.footerExtracted
        });
    } catch (error: any) {
        console.error('Unified Compiler Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
