"use strict";
const { Model } = require("sequelize");
const { Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
    }

    static getTodos() {
      return this.findAll(); 
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }

    setCompletionStatus(complete) {
      const st = !complete;
      return this.update({ completed: st });
    }

    static async overdue(userId) {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date(), },
          completed: false,
          userId,
        },
      })
    }

    static async dueToday(userId) {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: new Date(), },
          completed: false,
          userId,
        }
      })
    }

    static async dueLater(userId) {
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date(), },
          completed: false,
          userId,
        }
      })
    }
    
    static async completed(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        }
      })
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
