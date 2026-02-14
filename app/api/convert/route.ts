import { NextResponse } from 'next/server';
import { compileHTML } from '@/lib/compiler';

export async function POST(req: Request) {
    try {
        const { html, templateName, includeHeader } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML is required' }, { status: 400 });
        }

        // UNIFIED PIPELINE v3.2.0
        // Now supports optional Template Name header inclusion
        const result = compileHTML(
            html,
            templateName || 'Generated Template',
            includeHeader !== false // Default to true if not provided
        );

        return NextResponse.json({
            php: result.php,
            acf: result.acf,
            model: result.model,
            reports: result.reports,
            optimizedHtml: result.optimizedHtml
        });
    } catch (error: any) {
        console.error('Unified Compiler Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
