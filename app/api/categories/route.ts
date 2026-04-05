import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("category_id, category_name, category_desc")
    .order("category_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = (await request.json()) as {
    category_name?: string;
    category_desc?: string | null;
  };

  if (!body.category_name?.trim()) {
    return NextResponse.json({ error: "category_name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      category_name: body.category_name.trim(),
      category_desc: body.category_desc ?? null,
    })
    .select("category_id, category_name, category_desc")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
