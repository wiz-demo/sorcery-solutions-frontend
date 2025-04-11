import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
    try {
        // Expect "yaml_content" instead of "yaml"
        const { yaml_content } = await req.json();

        const res = await fetch(`${API_BASE_URL}/api/import_spellbook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ yaml_content }), // Pass "yaml_content" to the backend
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error uploading YAML:', error);
        return NextResponse.json({ error: 'Failed to upload YAML file' }, { status: 500 });
    }
}