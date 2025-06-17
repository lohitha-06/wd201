"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const todooverdue = await Todo.overdue();
      const formattedOverdue = todooverdue
        .map((todo) => todo.displayableString())
        .join("\n")
        .trim();
      console.log(formattedOverdue);
      console.log("\n");

      console.log("Due Today");
      const tododueToday = await Todo.dueToday();
      const formattedDueToday = tododueToday
        .map((todo) => todo.displayableString())
        .join("\n")
        .trim();
      console.log(formattedDueToday);
      console.log("\n");

      console.log("Due Later");
      const tododueLater = await Todo.dueLater();
      const formattedDueLater = dueLater
        .map((todo) => todo.displayableString())
        .join("\n")
        .trim();
      console.log(formattedDueLater);
    }

    static async overdue() {
      const todooverdue = await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
        },
      });

      return todooverdue;
    }

    static async dueToday() {
      const tododueToday = await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() },
        },
      });

      return tododueToday;
    }

    static async dueLater() {
      const tododueLater = await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
        },
      });

      return tododueLater;
    }

    static async markAsComplete(id) {
      await Todo.update(
        {
          completed: true,
        },
        {
          // eslint-disable-next-line object-shorthand
          where: { id: id },
        }
      );
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      let dueDateString="";

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const duedate = new Date(this.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (this.completed || dueDate > today) {
        dueDateString = dueDate.toISOString().slice(0, 10);
      }

      return `${this.id}. ${checkbox} ${this.title} ${dueDateString}`;
    }
    
    static associate(models) {
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
