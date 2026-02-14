import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
export async function POST(req: Request) {
    try {
        // Initialize Resend - No fallback to ensure clear error if env is missing
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Send email notification - using verified from address from working snippet
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['qamruzzamankhan96@gmail.com'],
            subject: 'New Waitlist Signup: PressStack',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h1 style="color: #4f46e5;">New Waitlist Signup!</h1>
                    <p>Someone just joined the PressStack waitlist.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px;">
                        <strong>Email Address:</strong> ${email}
                    </div>
                    <p style="margin-top: 20px; font-size: 14px; color: #666;">
                        Sent automatically from your PressStack landing page.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: data?.id });
    } catch (error: any) {
        console.error('Waitlist API Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
