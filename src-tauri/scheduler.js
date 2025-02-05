const { baseParse } = require("org-file-parser-with-js");
const fs = require("fs");
const createWorker = require("tesseract.js");

async function recognizeImage(image) {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(image);
  await worker.terminate();
  return ret.data.text;
}

async function parseOrgFile(text) {
  const orgFile = baseParse(text);
  return orgFile;
}

async function parseScheduledEvents(text) {
  const orgFile = baseParse(text);
  return orgFile.children
    .filter((node) =>
      node.properties?.some((prop) => prop.name === "SCHEDULED"),
    )
    .map((node) => ({
      title: node.title.content.trim(),
      link: node.properties.find((prop) => prop.name === "LINK")?.value,
      action: node.properties.find((prop) => prop.name === "ACTION")?.value,
      date: node.properties.find((prop) => prop.name === "SCHEDULED").value
        .date,
    }));
}

function appendOrgEvent(filePath, entry) {
  // * TODO ${event.title}
  // SCHEDULED: ${event.scheduled}
  // `LINK: ${event.link}` : ""}
  // `ACTION: ${event.action}` : ""}
  // :END:
  // `;
  fs.appendFile(filePath, entry, "utf8", (err) => {
    if (err) {
      console.error("Error appending event:", err);
    } else {
      console.log("Event appended successfully.");
    }
  });
}

async function getScheduledEvents() {
  const text = await ReadFile("schedule.org");
  const parsed = parseScheduledEvents(text);

  if (parsed.length == 0) {
    return [];
  }

  const now = new Date();
  const nextTenMinutes = new Date(now.getTime() + 10 * 60 * 1000);

  for (const task of parsed) {
    const date = new Date(task.date);
    if (date > nextTenMinutes) {
      task.now = true;
    } else {
      task.now = false;
    }
  }
  return parsed;
}

async function ReadFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function main() {
  if (process.argv[2] === "agenda") {
    console.dir(getScheduledEvents(orgText), { depth: null });
  } else if (process.argv[2] == "ocr") {
    const image = await recognizeImage(process.argv[3]);
    console.log(image);
  }
}

main();

// {
//   type: 0,
//   children: [
//     {
//       type: 3,
//       title: {
//         type: 1,
//         content: 'TODO Write stuff',
//         indent: 0,
//         children: [
//           { type: 10, content: 'TODO', children: [], state: 'TODO' },
//           { type: 1, content: 'Write stuff   ' }
//         ]
//       },
//       indent: 0,
//       level: 1,
//       properties: [
//         {
//           name: 'SCHEDULED',
//           value: {
//             year: '2023',
//             month: '03',
//             day: '01',
//             week: 'Wed',
//             date: '2023-03-01'
//           }
//         }
//       ],
//       tags: []
//     },
//     {
//       type: 3,
//       title: {
//         type: 1,
//         content: 'TODO Write even',
//         indent: 0,
//         children: [
//           { type: 10, content: 'TODO', children: [], state: 'TODO' },
//           { type: 1, content: 'Write even   ' }
//         ]
//       },
//       indent: 0,
//       level: 1,
//       properties: [
//         {
//           name: 'SCHEDULED',
//           value: {
//             year: '2023',
//             month: '03',
//             day: '01',
//             week: 'Wed',
//             date: '2023-03-01'
//           }
//         }
//       ],
//       tags: []
//     },
//     {
//       type: 3,
//       title: {
//         type: 1,
//         content: 'TODO Write more stuff',
//         indent: 0,
//         children: [
//           { type: 10, content: 'TODO', children: [], state: 'TODO' },
//           { type: 1, content: 'Write more stuff   ' }
//         ]
//       },
//       indent: 0,
//       level: 1,
//       properties: [
//         {
//           name: 'SCHEDULED',
//           value: {
//             year: '2023',
//             month: '03',
//             day: '01',
//             week: 'Wed',
//             date: '2023-03-01'
//           }
//         }
//       ],
//       tags: []
//     }
//   ],
//   properties: [],
//   footnotes: [],
//   options: undefined
// }
