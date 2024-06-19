const { main } = require("./");

const readline = require("readline");
const util = require("util");

jest.mock("readline");

jest.mock("util", () => ({
  parseArgs: jest.fn(),
}));

describe("main", () => {
  let rl;
  let consoleLogSpy;
  let processExitSpy;
  let originalArgv;

  beforeAll(() => {
    originalArgv = process.argv;
  });

  beforeEach(() => {
    rl = {
      question: jest.fn(),
      close: jest.fn(),
    };
    readline.createInterface.mockReturnValue(rl);
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    parseArgsSpy = jest.spyOn(util, "parseArgs");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.argv = originalArgv;
  });

  it("should print usage", async () => {
    util.parseArgs.mockReturnValue({
      values: { help: true },
      positionals: [],
    });

    main();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Usage: ts-starter [project-name]"
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
