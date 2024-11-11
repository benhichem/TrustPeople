import { greet } from "./greeting";

describe("Greeting", () => {
  test("should greet", () => {
    expect(greet()).toBe("Hello, world!");
  });
});
