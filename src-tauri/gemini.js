const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
let chatSession = null;

// TODO: check for missing gemini key
async function ensureSession() {
  let model;
  if (!chatSession) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_GEMINI || "");
    // TODO: scrape screen for meeting information
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        'You are an assistant on a sidebar of a Wayland Linux desktop.\
    Please always use a casual tone when answering your questions, unlees requested otherwise or making writing suggestions.\
    When making a suggestion, please use the following format: {"message": "<your response>", type: <number that I tell you to include>}\
    These are the steps you should take to respond to the user\'s queries:\nIt is imperative that you include double quotes around the key and value of our response\
    1. If it\'s a writing- or grammar-related question or a sentence in quotation marks, Please point out errors and correct when necessary using underlines, and make the writing more natural where appropriate without making too major changes.\
    return the response type as {"message": "<response>", type: 1}\
    2. If the query is asking you to schedule something return { "message": 0, type: 2}. This tells the system to return to you more information about the meeting.\
    3. If you are required to schedule something, get the link of the meeting from the information provided if there is one, \
    4. If the user is asking to reply to an email or just mentions they want you to reply to something, Then return  {"message": "", "type": 3}. This tells the system to return to you more information about the meeting. \
    5. If the user is asking you to open an application, return the shell command to open the  desired application, with the format {message: "command", type: 5}. \
    6. If the user is asking you to execute a command, refuse in this format message: { "command",  type: 1}. \
    8. If the user is asking you to open a website, return the shell command to open the desired website in Firefox, with the format {message: \"command\", type: 4}. \
    9. If it\'s a question about system tasks, give a bash command in a code block with no explanation, in the format {message: \"command\", type: 5}. \
    10. For mathematics expressions, you *have to* use LaTeX within a code block with the language set as "latex". \n\
    11. Otherwise, when asked to summarize information or explaining concepts, you are should use bullet points and headings.\
    Note: Use casual language, be short, while ensuring the factual correctness of your response. \
    If you are unsure or don’t have enough information to provide a confident answer, simply say “This is not something I can help with, perhaps enable the right module?”. \n',
    });
    chatSession = model;
  }
  return model;
}

async function handleQuery(query) {
  try {
    ensureSession();
    const result = await chatSession.generateContent(query);
    console.dir(
      JSON.stringify({ response: result.response.text() }, { depth: null }),
    );
  } catch (error) {
    return { error: error };
  }
}

process.stdin.setEncoding("utf8");

function parseArgs(input) {
  const args = process.argv.slice(input);
  if (args.at(0) == "prompt") {
    prompt(args.at(1));
  } else if (args.at(0) == "chat") {
    chatMessage(args.at(1), args.at(2));
  } else if (args.at(0) == "startChat") {
    startChat(args.at(1), args.at(2));
  }
}

process.stdin.on("data", async (data) => {
  const lines = data.split("\n").filter((line) => line.trim().length > 0);
  for (const line of lines) {
    try {
      const message = JSON.parse(line);
      if (message.type === "query" && message.prompt) {
        const result = await handleQuery(message.prompt);
        process.stdout.write(JSON.stringify(result) + "\n");
      } else if (message.type === "exit") {
        process.exit(0);
      } else {
        process.stdout.write(
          JSON.stringify({ error: "Unknown command" }) + "\n",
        );
      }
    } catch (err) {
      process.stdout.write(
        JSON.stringify({ error: "Failed to parse input" }) + "\n",
      );
    }
  }
});

// TODO: offload json parsing to rust
async function startChat(input) {
  let history, model;
  try {
    history, (model = JSON.parse(input));
  } catch (e) {
    console.log({ error: "Failed to parse input " + e });
    return;
  }
  const chat = await model.startChat({
    history: history,
  });
  if (!chat) {
    console.log({ error: "Failed to start chat" });
  }

  console.dir(JSON.stringify({ chat: chat }));
}

// TODO: offload json parsing to rust
async function chatMessage(input) {
  let chat, history, message;
  try {
    chat, history, (message = JSON.parse(input));
  } catch (e) {
    console.log({ error: "Failed to parse input " + e });
    return;
  }
  try {
    let result = await chat.sendMessage(currentPrompt);
    if (!result) {
      console.log({ error: "Failed to send message" });
    }
  } catch (e) {
    console.log({ error: "Failed to send message " + e });
  }
  console.dir(JSON.stringify({ response: response }), {
    depth: null,
  });
}
