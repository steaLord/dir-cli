const {
  createPath,
  movePath,
  deletePath,
  processCommand,
  tree,
} = require("./main");

beforeEach(() => {
  Object.keys(tree).forEach((key) => delete tree[key]);
});

describe("createPath", () => {
  test("should create a simple path", () => {
    createPath("fruits");
    expect(tree).toEqual({ fruits: {} });
  });

  test("should create a nested path", () => {
    createPath("fruits/apples");
    expect(tree).toEqual({ fruits: { apples: {} } });
  });

  test("should not overwrite existing paths", () => {
    createPath("fruits");
    createPath("fruits/apples");
    createPath("fruits/oranges");
    expect(tree).toEqual({ fruits: { apples: {}, oranges: {} } });
  });
});

describe("movePath", () => {
  beforeEach(() => {
    createPath("fruits/apples");
    createPath("vegetables");
  });

  test("should move a path to a new location", () => {
    movePath("fruits/apples", "vegetables");
    expect(tree).toEqual({ fruits: {}, vegetables: { apples: {} } });
  });

  test("should not move a non-existent path", () => {
    movePath("fruits/oranges", "vegetables");
    expect(tree).toEqual({ fruits: { apples: {} }, vegetables: {} });
  });
});

describe("deletePath", () => {
  beforeEach(() => {
    createPath("fruits/apples");
  });

  test("should delete an existing path", () => {
    deletePath("fruits/apples");
    expect(tree).toEqual({ fruits: {} });
  });

  test("should not change the tree when deleting a non-existent path", () => {
    deletePath("fruits/oranges");
    expect(tree).toEqual({ fruits: { apples: {} } });
  });
});

describe("processCommand", () => {
  test("should process CREATE command", () => {
    processCommand("CREATE fruits/apples");
    expect(tree).toEqual({ fruits: { apples: {} } });
  });

  test("should process MOVE command", () => {
    processCommand("CREATE fruits/apples");
    processCommand("CREATE vegetables");
    processCommand("MOVE fruits/apples vegetables");
    expect(tree).toEqual({ fruits: {}, vegetables: { apples: {} } });
  });

  test("should process DELETE command", () => {
    processCommand("CREATE fruits/apples");
    processCommand("DELETE fruits/apples");
    expect(tree).toEqual({ fruits: {} });
  });

  test("should process LIST command", () => {
    const consoleSpy = jest.spyOn(console, "log");
    processCommand("CREATE fruits/apples");
    processCommand("LIST");
    expect(consoleSpy).toHaveBeenCalledWith("fruits");
    expect(consoleSpy).toHaveBeenCalledWith("  apples");
    consoleSpy.mockRestore();
  });
});
