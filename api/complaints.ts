import { Complaint } from "./_lib/models.ts";
import { connectDb } from "./_lib/db.ts";

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await connectDb();

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const complaints = (body as { complaints?: unknown[] })?.complaints;

    if (!Array.isArray(complaints)) {
      res.status(400).json({ error: "Complaints must be an array" });
      return;
    }

    const savedComplaints = await Complaint.insertMany(
      complaints.map((c: unknown) => ({
        text:
          typeof c === "string"
            ? c
            : String((c as { text?: string })?.text || ""),
        source:
          typeof c === "string"
            ? "user_input"
            : (c as { source?: string })?.source || "user_input",
      })),
    );

    res.status(201).json(savedComplaints);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
