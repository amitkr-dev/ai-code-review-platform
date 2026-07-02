/**
 * ============================================
 * Groq AI Service — Code Analysis
 * ============================================
 * Sends code to Groq Ai 1.5 Flash
 * with a structured prompt and parses the
 * JSON response into our Review schema format.
 */

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Analyze code using Groq and return structured review data.
 * @param {string} code - The source code to analyze
 * @param {string} language - Programming language identifier
 * @returns {Object} Structured analysis result
 */
async function analyzeCode(code, language) {
  const prompt = buildPrompt(code, language);

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    });

    const rawText = completion.choices[0].message.content;

    // Extract JSON from the response (handles markdown code blocks)
    const jsonMatch =
      rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI response could not be parsed as JSON");
    }

    const cleaned = (jsonMatch?.[1] || jsonMatch?.[0] || rawText)
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("========== INVALID JSON ==========");
      console.error(cleaned);
      console.error("==================================");

      throw new Error("Groq returned invalid JSON.");
    }
    [
      "bugs",
      "improvements",
      "namingSuggestions",
      "codeSmells",
      "securityIssues",
    ].forEach((field) => {
      if (typeof parsed[field] === "string") {
        try {
          parsed[field] = JSON.parse(
            parsed[field]
              .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
              .replace(/'/g, '"'),
          );
        } catch {
          parsed[field] = [];
        }
      }
    });

    // console.log("PARSED AI RESPONSE:", JSON.stringify(parsed, null, 2));

    // Validate and sanitize the parsed result
    return sanitizeResult(parsed);
  } catch (error) {
    console.error(
      "Groq Error:",
      error.response?.data || error.message || error,
    );
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Builds the structured prompt for code review.
 */
function buildPrompt(code, language) {
  return `You are an expert senior software engineer performing a thorough code review.
Analyze the following ${language.toUpperCase()} code and return ONLY a valid JSON object (no markdown, no explanation outside JSON) with this exact structure:

{
  "qualityScore": <number 0-100>,
  "summary": "<brief 1-2 sentence summary of what the code does>",
  "functionality": "<detailed explanation of code functionality>",
  "bugs": [
    { "description": "<what the bug is>", "line": "<approximate line number or range>", "severity": "<low|medium|high|critical>" }
  ],
  "improvements": [
    { "description": "<what to improve>", "example": "<code example showing the improvement>" }
  ],
  "namingSuggestions": [
    { "original": "<current name>", "suggested": "<better name>", "reason": "<why it's better>" }
  ],
  "codeSmells": [
    { "description": "<what the smell is>", "type": "<category like 'Long Method', 'Magic Number', 'Duplicate Code', 'Deep Nesting', etc.>" }
  ],
  "securityIssues": [
    { "description": "<what the vulnerability is>", "severity": "<low|medium|high|critical>" }
  ],
  "timeComplexity": "<Big O notation like O(n), O(n log n), O(n²)>",
  "spaceComplexity": "<Big O notation>",
  "complexityExplanation": "<explain WHY the complexity is what it is, referencing specific parts of the code>",
  "strengths": ["<thing done well>"],
  "overallFeedback": "<constructive overall assessment with actionable next steps>"
}

Rules:
- If a section has no findings, return an empty array [].
- qualityScore considers: correctness, readability, efficiency, security, and best practices.
- Be specific — reference actual variable names, functions, and line numbers.
- For improvements, provide actual code snippets when helpful.
- Be honest but constructive.

CODE TO ANALYZE (${language.toUpperCase()}):
\`\`\`${language}
 ${code}
\`\`\`

IMPORTANT:
- Return strictly valid JSON.
- Do not use single quotes.
- Do not return JavaScript objects.
- Do not stringify arrays.
- bugs, improvements, namingSuggestions, codeSmells, and securityIssues must be JSON arrays, not strings.
- All property names must be enclosed in double quotes.
- All string values must use double quotes.
- No markdown.
- No explanation.
- No text before or after the JSON.

Return ONLY the JSON object.`;
}

/**
 * Sanitizes and validates the AI response to match our schema.
 */
function sanitizeResult(data) {
  // console.log("RAW DATA:", JSON.stringify(data, null, 2));
  return {
    qualityScore: clamp(Number(data.qualityScore) || 0, 0, 100),
    summary: String(data.summary || "No summary generated."),
    functionality: String(
      data.functionality || "No functionality explanation generated.",
    ),
    bugs: (Array.isArray(data.bugs) ? data.bugs : []).map((b) => ({
      description: String(b.description || ""),
      line: String(b.line || "N/A"),
      severity: ["low", "medium", "high", "critical"].includes(b.severity)
        ? b.severity
        : "medium",
    })),
    improvements: (Array.isArray(data.improvements)
      ? data.improvements
      : []
    ).map((i) => ({
      description: String(i.description || ""),
      example: String(i.example || ""),
    })),
    namingSuggestions: (Array.isArray(data.namingSuggestions)
      ? data.namingSuggestions
      : []
    ).map((n) => ({
      original: String(n.original || ""),
      suggested: String(n.suggested || ""),
      reason: String(n.reason || ""),
    })),
    codeSmells: (Array.isArray(data.codeSmells) ? data.codeSmells : []).map(
      (c) => ({
        description: String(c.description || ""),
        type: String(c.type || "General"),
      }),
    ),
    securityIssues: (Array.isArray(data.securityIssues)
      ? data.securityIssues
      : []
    ).map((s) => ({
      description: String(s.description || ""),
      severity: ["low", "medium", "high", "critical"].includes(s.severity)
        ? s.severity
        : "medium",
    })),
    timeComplexity: String(data.timeComplexity || "N/A"),
    spaceComplexity: String(data.spaceComplexity || "N/A"),
    complexityExplanation: String(
      data.complexityExplanation || "No complexity explanation generated.",
    ),
    strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : [],
    overallFeedback: String(
      data.overallFeedback || "No overall feedback generated.",
    ),
  };
}

/** Clamps a number between min and max */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

async function streamReview(code, language) {
  if (!code || typeof code !== "string") {
    throw new Error("Invalid code input");
  }

  const prompt = buildPrompt(code, language || "unknown");

  // stream: true returns an async iterator — do NOT await the whole thing
  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a Senior Staff Engineer at a FAANG company. " +
          "Perform a thorough code review. Cover: bugs, security vulnerabilities, " +
          "performance issues, code smells, naming, complexity (time + space), " +
          "and best practices. Be specific. Reference line numbers when possible. " +
          "Format your response in clean Markdown.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    stream: true, // KEY: enables token-by-token streaming
  });

  return stream;
}
module.exports = {
  analyzeCode,
  streamReview,
};
