import { Issue, SprintTask } from "./_lib/models";
import { runAnalysisPipeline } from "../src/services/gemini.ts";
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
    const complaints = (body as { complaints?: string[] })?.complaints;

    if (!Array.isArray(complaints) || complaints.length === 0) {
      res.status(400).json({ error: "No complaints provided for analysis" });
      return;
    }

    const analysisResults = await runAnalysisPipeline(complaints);
    const savedIssues = [];

    for (const item of analysisResults) {
      const issue = new Issue({
        issue: item.issue,
        category: item.category,
        sentiment: item.sentiment,
        severity: item.severity,
        frequency: item.frequency,
        priorityScore: item.priorityScore,
        priorityLevel: item.priorityLevel,
        label: item.label,
      });
      await issue.save();
      savedIssues.push(issue);

      const sprintTask = new SprintTask({
        userStory: item.sprintTask.userStory,
        acceptanceCriteria: item.sprintTask.acceptanceCriteria,
        storyPoints: item.sprintTask.storyPoints,
        issueId: issue._id,
      });
      await sprintTask.save();
    }

    res.status(200).json({ message: "Analysis complete", issues: savedIssues });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
