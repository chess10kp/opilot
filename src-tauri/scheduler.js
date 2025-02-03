const { baseParse } = require("org-file-parser-with-js");

async function parseOrgFile(text) {
  const orgFile = baseParse(text);
  return orgFile;
}

async function getScheduledEvents(text) {
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

const orgText = `
* TODO Schedule this 
SCHEDULED: <2025-02-07 Fri>
:LOGBOOK:
LINK: link to meeting?
ACTION: name_of_action
:END:
`;

console.dir(getScheduledEvents(orgText), { depth: null });
// console.dir(parseOrgFile(orgText), { depth: null });

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
