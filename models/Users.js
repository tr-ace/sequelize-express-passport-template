/**
 * Import Sequelize.
 */
const { Sequelize, DataTypes, Model } = require("sequelize");

/**
 * Import the Sequelize instance that you have exported
 * in the config/database.js file.
 */
const sequelize = require("../db");

/**
 * Define a model that can be managed by Sequelize.
 */
class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.TEXT, // used to be unique, but didnt work
    },
    hashed_password: {
      type: DataTypes.BLOB
    },
    salt: {
      type: DataTypes.BLOB
    },
    name: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize, // Pass the connection instance
    modelName: "Users", // Provide the name of the table
  }
);

/**
 * Export the model, so that it can be used in any
 * page to execute CRUD operations on the app_posts table.
 */
module.exports = User;