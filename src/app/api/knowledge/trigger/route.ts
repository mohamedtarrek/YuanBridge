import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Auto knowledge workers are disabled. All operations are now manual via the Admin Dashboard.',
    timestamp: new Date().toISOString(),
  })
}
