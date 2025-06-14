const todoList = require('../todo.js');

describe('Todo List', () => {
  let todos;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  beforeEach(() => {
    todos = todoList();
  });

  test('should add a new todo', () => {
    todos.add({ title: 'Test todo', dueDate: today, completed: false });
    expect(todos.all.length).toBe(1);
    expect(todos.all[0].title).toBe('Test todo');
  });

  test('should mark a todo as completed', () => {
    todos.add({ title: 'Test todo', dueDate: today, completed: false });
    todos.markAsComplete(0);
    expect(todos.all[0].completed).toBe(true);
  });

  test('should retrieve overdue items', () => {
    todos.add({ title: 'Overdue', dueDate: yesterday, completed: false });
    todos.add({ title: 'Today', dueDate: today, completed: false });
    expect(todos.overdue().length).toBe(1);
    expect(todos.overdue()[0].title).toBe('Overdue');
  });

  test('should retrieve due today items', () => {
    todos.add({ title: 'Today', dueDate: today, completed: false });
    todos.add({ title: 'Tomorrow', dueDate: tomorrow, completed: false });
    expect(todos.dueToday().length).toBe(1);
    expect(todos.dueToday()[0].title).toBe('Today');
  });

  test('should retrieve due later items', () => {
    todos.add({ title: 'Tomorrow', dueDate: tomorrow, completed: false });
    todos.add({ title: 'Today', dueDate: today, completed: false });
    expect(todos.dueLater().length).toBe(1);
    expect(todos.dueLater()[0].title).toBe('Tomorrow');
  });
});
