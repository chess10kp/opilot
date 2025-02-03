const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

async function prompt(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_GEMINI);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);

  console.dir(JSON.stringify(result.response.text()));
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.at(0) == "prompt") {
    prompt(args.at(1));
  }
}

parseArgs();
