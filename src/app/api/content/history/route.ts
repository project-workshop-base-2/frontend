import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('[Content History API] Request params:', { userAddress, limit, offset });

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'userAddress is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    console.log('[Content History API] Supabase client initialized');

    const { data, error, count } = await supabase
      .from('content_history')
      .select('*', { count: 'exact' })
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Content History API] Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[Content History API] Query success:', { count, dataLength: data?.length || 0 });

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
    });

  } catch (error) {
    console.error('[Content History API] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
