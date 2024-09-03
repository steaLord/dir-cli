const readline = require("readline");
const fs = require("fs");

let tree = {};

function createPath(path) {
  let current = tree;
  const parts = path.split("/");
  for (const part of parts) {
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }
  console.log(`Created: ${path}`);
}

function movePath(sourcePath, destPath) {
  const sourceparts = sourcePath.split("/");
  const destparts = destPath.split("/");
  const item = sourceparts.pop();
  let source = tree;
  let dest = tree;

  for (const part of sourceparts) {
    if (!source[part])
      return console.log(`Cannot move: ${sourcePath} does not exist`);
    source = source[part];
  }

  for (const part of destparts) {
    if (!dest[part]) dest[part] = {};
    dest = dest[part];
  }

  if (!source[item])
    return console.log(`Cannot move: ${sourcePath} does not exist`);
  dest[item] = source[item];
  delete source[item];
  console.log(`Moved ${sourcePath} to ${destPath}`);
}

function deletePath(path) {
  const parts = path.split("/");
  const item = parts.pop();
  let current = tree;

  for (const part of parts) {
    if (!current[part])
      return console.log(`Cannot delete ${path} - ${part} does not exist`);
    current = current[part];
  }

  if (!current[item])
    return console.log(`Cannot delete ${path} - ${item} does not exist`);
  delete current[item];
  console.log(`Deleted: ${path}`);
}

function listTree(node = tree, prefix = "") {
  for (const [key, value] of Object.entries(node)) {
    console.log(prefix + key);
    if (typeof value === "object") {
      listTree(value, prefix + "  ");
    }
  }
}

function processCommand(input) {
  const [command, ...args] = input.split(" ");

  switch (command.toUpperCase()) {
    case "CREATE":
      createPath(args[0]);
      break;
    case "MOVE":
      movePath(args[0], args[1]);
      break;
    case "DELETE":
      deletePath(args[0]);
      break;
    case "LIST":
      listTree();
      break;
    default:
      console.log(
        "Unknown command. Available commands: CREATE, MOVE, DELETE, LIST"
      );
  }
}

function runInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log(
    "Type your commands (CREATE, MOVE, DELETE, LIST) or EXIT to quit."
  );
  rl.prompt();

  rl.on("line", (line) => {
    if (line.trim().toUpperCase() === "EXIT") {
      rl.close();
      return;
    }
    processCommand(line.trim());
    rl.prompt();
  }).on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
}

function runCommandFromArgs() {
  const command = process.argv.slice(2).join(" ");
  processCommand(command);
}

function runCommandsFromFile(filename) {
  try {
    const commands = fs.readFileSync(filename, "utf8").split("\n");
    commands.forEach((command) => {
      if (command.trim()) {
        console.log(`Executing: ${command}`);
        processCommand(command.trim());
      }
    });
  } catch (e) {
    console.log(e.message);
  }
}

const STORAGE_FILE_NAME = "storage.json";

if (fs.existsSync(STORAGE_FILE_NAME)) {
  const storage = fs.readFileSync(STORAGE_FILE_NAME, "utf8");
  if (storage) {
    tree = JSON.parse(storage);
  }
}

if (process.argv.length > 2) {
  if (process.argv[2] === "--file") {
    runCommandsFromFile(process.argv[3]);
  } else {
    runCommandFromArgs();
  }
} else {
  if (require.main === module) {
    runInteractiveMode();
  }
}

process.on("exit", () => {
  fs.writeFileSync(STORAGE_FILE_NAME, JSON.stringify(tree, null, 2));
});

// экспорт для тестов
module.exports = {
  createPath,
  movePath,
  deletePath,
  processCommand,
  tree,
};
