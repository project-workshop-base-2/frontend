import { NextRequest, NextResponse } from "next/server";
import {
  getPersonalityTemplates,
  getPersonalityTemplateById,
  getPersonalityTemplatesByCategory,
} from "@/data/personality-templates";
import { PersonalityConfig } from "@/types/personality";

export interface TemplatesResponseBody {
  success: boolean;
  templates?: PersonalityConfig[];
  template?: PersonalityConfig;
  error?: string;
}

/**
 * GET /api/personality/templates
 * Get all templates or filter by category
 * Query params:
 *   - category: filter by category (tech, crypto, business, creative, custom)
 *   - id: get specific template by ID
 */
export async function GET(request: NextRequest): Promise<NextResponse<TemplatesResponseBody>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const category = searchParams.get("category") as PersonalityConfig["category"] | null;

    // Get specific template by ID
    if (id) {
      const template = getPersonalityTemplateById(id);
      if (!template) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, template });
    }

    // Filter by category
    if (category) {
      const templates = getPersonalityTemplatesByCategory(category);
      return NextResponse.json({ success: true, templates });
    }

    // Get all templates
    const templates = getPersonalityTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
