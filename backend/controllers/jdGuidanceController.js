import fs from "fs";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import axios from "axios";
import {configDotenv} from "dotenv";

configDotenv(); // Load environment variables from .env

export const jdGuidance = async (req, res) => {
  try {
    console.log("📥 Resume analysis request received");

    if (!req.file) {
      return res.status(400).json({message: "No resume file uploaded."});
    }

    const filePath = req.file.path;
    let resumeText = "";
    const jobDescription =
      req.body.jobDescription || " No job description provided.";
    try {
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        resumeText = pdfData.text;
      } else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({path: filePath});
        resumeText = result.value;
      } else if (req.file.mimetype === "text/plain") {
        resumeText = fs.readFileSync(filePath, "utf8");
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({message: "Unsupported file format."});
      }
    } catch (extractionErr) {
      fs.unlinkSync(filePath);
      return res.status(500).json({
        message: "Failed to extract resume text.",
        error: extractionErr.message,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    const prompt = `
    You are a professional resume reviewer.
    
    Given the resume and the job description below, provide clear, concise improvement suggestions for the resume.
    
    Your response **must only be short bullet points**, not a paragraph or prose.
    
    Each bullet should be:
    - 1 sentence only
    - Specific and actionable
    - Focused on improving content, structure, clarity, grammar, or relevance
    - Plain text only, no formatting or headers
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Output Example:
    - Fix inconsistent date formatting (e.g., "Nov 2024 - Present" for roles).
    - Move branch change achievement under Education for better impact.
    - Limit each project to 2–3 concise bullet points, highlighting outcomes.
    - Add locations to all roles for clarity.
    - Replace general skills like "Task Execution" with real examples.
    - Ensure all GitHub/LinkedIn links are clickable and correct.
    - Add quantifiable data to roles (e.g., number of users, traffic improvements).
    - End bullet points consistently with periods.
    
    ONLY return your feedback in the bullet format above.
    `.trim();

    // Call OpenRouter API
    let openRouterResponse;
    try {
      openRouterResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );
    } catch (apiErr) {
      return res.status(500).json({
        message: "OpenRouter API call failed.",
        error: apiErr?.response?.data || apiErr.message,
      });
    }

    const resultText =
      openRouterResponse?.data?.choices?.[0]?.message?.content ||
      "No response from model.";

    return res.json({feedback: resultText});
  } catch (err) {
    console.error("❌ Resume analysis failed:", err);
    return res.status(500).json({
      message: "Unexpected error during resume analysis.",
      error: err.message || err,
    });
  }
};
