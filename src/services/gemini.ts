const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

type AnalysisItem = {
  issue: string;
  category: string;
  sentiment: string;
  severity: number;
  frequency: number;
  priorityScore: number;
  priorityLevel: "High" | "Medium" | "Low" | string;
  label:
    | "Critical & Widespread"
    | "Silent but Frequent"
    | "Loud but Rare"
    | string;
  sprintTask: {
    userStory: string;
    acceptanceCriteria: string[];
    storyPoints: number;
  };
};

function extractJson(raw: string): string {
  const fenced =
    raw.match(/```json\s*([\s\S]*?)\s*```/i) ||
    raw.match(/```\s*([\s\S]*?)\s*```/i);
  return fenced?.[1]?.trim() || raw.trim();
}

function normalizeIssues(input: unknown): AnalysisItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      const sprint = (row.sprintTask as Record<string, unknown>) || {};
      const criteriaRaw = Array.isArray(sprint.acceptanceCriteria)
        ? sprint.acceptanceCriteria
        : [];
      const criteria = criteriaRaw
        .map((c) => String(c))
        .filter(Boolean)
        .slice(0, 5);

      return {
        issue: String(row.issue || "Unspecified issue"),
        category: String(row.category || "General"),
        sentiment: String(row.sentiment || "Neutral"),
        severity: Number(row.severity || 1),
        frequency: Number(row.frequency || 1),
        priorityScore: Number(row.priorityScore || 1),
        priorityLevel: String(row.priorityLevel || "Low"),
        label: String(row.label || "Silent but Frequent"),
        sprintTask: {
          userStory: String(
            sprint.userStory ||
              "As a user, I want a smoother experience, so that I can complete my work without friction.",
          ),
          acceptanceCriteria:
            criteria.length > 0
              ? criteria
              : [
                  "Issue is reproducible",
                  "Fix is validated",
                  "No regression in core workflow",
                ],
          storyPoints: Number(sprint.storyPoints || 3),
        },
      };
    })
    .map((item) => ({
      ...item,
      severity: Math.max(
        1,
        Math.min(10, Number.isFinite(item.severity) ? item.severity : 1),
      ),
      frequency: Math.max(
        1,
        Number.isFinite(item.frequency) ? item.frequency : 1,
      ),
      priorityScore: Math.max(
        1,
        Math.min(
          10,
          Number.isFinite(item.priorityScore) ? item.priorityScore : 1,
        ),
      ),
      sprintTask: {
        ...item.sprintTask,
        storyPoints: [1, 2, 3, 5, 8, 13].includes(item.sprintTask.storyPoints)
          ? item.sprintTask.storyPoints
          : 3,
      },
    }));
}

export async function runAnalysisPipeline(complaints: string[]) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const mistralModel = process.env.MISTRAL_MODEL || "mistral-large-latest";

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured.");
  }

  const cleanComplaints = complaints.map((c) => c.trim()).filter(Boolean);
  if (cleanComplaints.length === 0) {
    return [];
  }

  const systemPrompt =
    "You are a senior Customer Experience Analyst and Product Strategist. Return only valid JSON that matches the provided schema.";

  const userPrompt = `
Analyze the complaints and produce an array called "issues" where each item includes:
- issue (string)
- category (string)
- sentiment (Angry/Frustrated/Confused/Neutral)
- severity (1-10)
- frequency (integer)
- priorityScore (1-10)
- priorityLevel (High/Medium/Low)
- label (Critical & Widespread/Silent but Frequent/Loud but Rare)
- sprintTask object with userStory, acceptanceCriteria (3-5 items), storyPoints (1,2,3,5,8,13)

Priority guidance:
Priority = (frequency * 0.4) + (severity * 0.4) + (sentimentWeight * 0.2)
sentimentWeight: Angry=10, Frustrated=7, Confused=5, Neutral=3

Complaints:
${JSON.stringify(cleanComplaints)}
`;

  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: mistralModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "complaint_analysis",
          schema: {
            type: "object",
            properties: {
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    issue: { type: "string" },
                    category: { type: "string" },
                    sentiment: { type: "string" },
                    severity: { type: "number" },
                    frequency: { type: "number" },
                    priorityScore: { type: "number" },
                    priorityLevel: { type: "string" },
                    label: { type: "string" },
                    sprintTask: {
                      type: "object",
                      properties: {
                        userStory: { type: "string" },
                        acceptanceCriteria: {
                          type: "array",
                          items: { type: "string" },
                        },
                        storyPoints: { type: "number" },
                      },
                      required: [
                        "userStory",
                        "acceptanceCriteria",
                        "storyPoints",
                      ],
                      additionalProperties: false,
                    },
                  },
                  required: [
                    "issue",
                    "category",
                    "sentiment",
                    "severity",
                    "frequency",
                    "priorityScore",
                    "priorityLevel",
                    "label",
                    "sprintTask",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["issues"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Mistral API request failed: ${response.status} ${errorText}`,
    );
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  const output = Array.isArray(content)
    ? content
        .map((part: { type?: string; text?: string }) => part.text || "")
        .join("\n")
    : String(content || "");

  let parsed: { issues?: unknown[] } = { issues: [] };
  try {
    parsed = JSON.parse(extractJson(output));
  } catch {
    parsed = { issues: [] };
  }

  return normalizeIssues(parsed.issues);
}
