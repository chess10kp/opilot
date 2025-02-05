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
  } else if (args.at(0) == "chat") {
    chatMessage(args.at(1), args.at(2));
  } else if (args.at(0) == "startChat") {
    startChat(args.at(1), args.at(2));
  }
}

// TODO: offload json parsing to rust
async function startChat(input) {
  let history,
    model = JSON.parse(input);
  const chat = await model.startChat({
    history: history,
  });
  if (!chat) {
    return { error: "Failed to start chat" };
  }

  console.dir(JSON.stringify({ chat: chat }));
}

// TODO: offload json parsing to rust
async function chatMessage({ chat, history, message }) {
  let chat,
    history,
    message = JSON.parse(input);
  try {
    let result = await chat.sendMessage(currentPrompt);
    if (!result) {
      return { error: "Failed to send message" };
    }
  } catch (e) {
    return { error: "Failed to send message " + e };
  }
  console.dir(JSON.stringify({ response: response }), {
    depth: null,
  });
}

parseArgs();
