import { NextRequest, NextResponse } from "next/server";

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
};

export async function GET(request: NextRequest) {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ suggestions: [], providerReady: false });
  }

  const query = String(request.nextUrl.searchParams.get("query") || "").trim();
  const city = String(request.nextUrl.searchParams.get("city") || "").trim();

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [], providerReady: true });
  }

  const input = city ? `${query}, ${city}, Colombia` : `${query}, Colombia`;

  try {
    const googleResponse = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["co"],
          includedPrimaryTypes: ["(regions)"],
          languageCode: "es",
          regionCode: "co",
        }),
        cache: "no-store",
      }
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        {
          suggestions: [],
          providerReady: true,
          error: `Autocomplete failed with status ${googleResponse.status}`,
        },
        { status: 200 }
      );
    }

    const payload = (await googleResponse.json()) as GoogleAutocompleteResponse;
    const suggestions = (payload.suggestions ?? [])
      .map((item) => {
        const prediction = item.placePrediction;
        if (!prediction) return null;

        const mainText = String(
          prediction.structuredFormat?.mainText?.text || ""
        ).trim();
        const fullText = String(prediction.text?.text || "").trim();
        const label = mainText || fullText;

        if (!label) return null;

        return {
          placeId: prediction.placeId ?? null,
          label,
          fullText,
          secondaryText: String(
            prediction.structuredFormat?.secondaryText?.text || ""
          ).trim(),
        };
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions, providerReady: true });
  } catch {
    return NextResponse.json(
      { suggestions: [], providerReady: true, error: "Autocomplete failed" },
      { status: 200 }
    );
  }
}
