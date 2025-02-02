const fs = require("fs");
const path = require("path");

const APPLICATIONS_DIRS = [
  "/usr/share/applications",
  path.join(process.env.HOME, ".local/share/applications"),
];
const ICONS_DIRS = [
  "/usr/share/icons/hicolor",
  path.join(process.env.HOME, ".local/share/icons/hicolor"),
];

function getDesktopFiles() {
  const desktopFiles = [];
  APPLICATIONS_DIRS.forEach((dir) => {
    try {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        if (file.endsWith(".desktop")) {
          const fullPath = path.join(dir, file);
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            desktopFiles.push({ filePath: fullPath, content });
          } catch (readErr) {
            // Skip files that cannot be read
            console.error(`Error reading ${fullPath}: ${readErr}`);
          }
        }
      });
    } catch (err) {}
  });
  return desktopFiles;
}

function findIconPath(iconName) {
  for (const baseIconDir of ICONS_DIRS) {
    let sizes;
    try {
      sizes = fs
        .readdirSync(baseIconDir)
        .filter((dir) => /^[0-9]+x[0-9]+$/.test(dir));
    } catch (err) {
      continue;
    }
    for (const size of sizes) {
      const iconFolder = path.join(baseIconDir, size, "apps");
      const pngPath = path.join(iconFolder, `${iconName}.png`);
      const svgPath = path.join(iconFolder, `${iconName}.svg`);
      if (fs.existsSync(pngPath)) {
        return pngPath;
      } else if (fs.existsSync(svgPath)) {
        return svgPath;
      }
    }
  }
  return null;
}

function getDesktopIcons() {
  const icons = {};
  const desktopFiles = getDesktopFiles();

  desktopFiles.forEach(({ filePath, content }) => {
    const appMatch = content.match(/^Name=(.+)$/m);
    const appName = appMatch
      ? appMatch[1].trim().toString()
      : path.basename(filePath, ".desktop");
    const iconMatch = content.match(/^Icon=(.+)$/m);
    if (iconMatch) {
      const iconName = iconMatch[1].trim();
      const iconPath = findIconPath(iconName);
      if (iconPath) {
        icons[appName.toString()] = iconPath;
      }
    }
  });

  return icons;
}

console.log(JSON.stringify(getDesktopIcons()));
