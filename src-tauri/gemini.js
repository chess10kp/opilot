const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_GEMINI);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Explain how AI works";
  const result = await model.generateContent(prompt);

  console.log(process.env.GOOGLE_API_GEMINI);
  console.dir(result.response.text());
}

run();
