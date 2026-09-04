import { NextResponse } from 'next/server';

/**
 * Liveness for the web process (cicd.md §3): reports the running commit SHA so
 * a deployed artifact is traceable to a commit.
 *
 * This is process infrastructure, not a ZENLABS product route: it performs no
 * database, queue or provider call and exposes no product data.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    process: 'web',
    commitSha: process.env.COMMIT_SHA ?? 'unknown',
  });
}
