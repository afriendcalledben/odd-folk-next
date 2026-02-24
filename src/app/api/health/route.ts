import { successResponse } from '@/lib/api-response';

// GET /api/health - Health check
export async function GET() {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
