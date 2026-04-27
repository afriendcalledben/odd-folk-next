import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const validCode = process.env.PREVIEW_CODE;

  if (!validCode || code !== validCode) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('preview_access', '1', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
