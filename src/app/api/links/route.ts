import { NextResponse } from "next/server";

import { LINK_DEFS, normalizeLinkCounts } from "@/lib/linkClicks";
import { getDatabase } from "@/lib/mongodb";

const COLLECTION_NAME = "link_counts";

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const documents = await collection.find({}).project({ _id: 1, count: 1 }).toArray();

    const counts = documents.reduce<Record<string, number>>((accumulator, document) => {
      const key = String(document._id ?? "");
      if (!key) {
        return accumulator;
      }

      accumulator[key] = Number(document.count ?? 0);
      return accumulator;
    }, {});

    return NextResponse.json({ counts: normalizeLinkCounts(counts) });
  } catch (error) {
    console.error("Failed to load link counts:", error);
    return NextResponse.json({ counts: normalizeLinkCounts() }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { id?: string };
    const linkId = body.id ?? "";

    if (!LINK_DEFS.some((link) => link.id === linkId)) {
      return NextResponse.json({ error: "유효하지 않은 링크 ID입니다." }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<{ _id: string; count?: number }>(COLLECTION_NAME);
    const currentDocument = await collection.findOne({ _id: linkId });
    const nextCount = (typeof currentDocument?.count === "number" ? currentDocument.count : 0) + 1;

    await collection.updateOne(
      { _id: linkId },
      { $set: { count: nextCount, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ id: linkId, count: nextCount });
  } catch (error) {
    console.error("Failed to update link count:", error);
    return NextResponse.json({ error: "클릭 수 업데이트에 실패했습니다." }, { status: 500 });
  }
}
