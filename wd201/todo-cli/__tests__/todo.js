const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();
describe("Todo List Test Suite", () => {
  beforeAll(() => {
    const today = new Date();
    const day_ = 60 * 60 * 24 * 1000;
    [
      {
        title: "Prepare for exam",
        completed: false,
        dueDate: new Date(today.getTime() - 3 * day_).toLocaleDateString("en-CA"),
      },
      {
        title: "Revise for exam",
        completed: false,
        dueDate: new Date(today.getTime() - day_).toLocaleDateString("en-CA"),
      },
      {
        title: "Submit Pupils level 4",
        completed: false,
        dueDate: new Date().toLocaleDateString("en-CA"),
      },
      {
        title: "Print the admit card",
        completed: false,
        dueDate: new Date().toLocaleDateString("en-CA"),
      },
      {
        title: "orderin lunch",
        completed: false,
        dueDate: new Date(today.getTime() + 2 * day_).toLocaleDateString(
          "en-CA"
        ),
      },
    ].forEach(add);
  });
  test("Should add a new todo", () => {
    expect(all.length).toEqual(5);

    add({
      title: "A test item",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });

    expect(all.length).toEqual(6);
  });

  test("Should mark a todo as complete", () => {
    expect(all[0].completed).toEqual(false);
    markAsComplete(0);
    expect(all[0].completed).toEqual(true);
  });

  test("Should retrieve overdue items", () => {
    expect(overdue().length).toEqual(2);
  });

  test("Should retrieve due today items", () => {
    expect(dueToday().length).toEqual(3);
  });

  test("Should retrieve due later items", () => {
    expect(dueLater().length).toEqual(1);
  });
});
