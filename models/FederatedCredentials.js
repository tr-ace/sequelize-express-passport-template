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
class FederatedCredential extends Model {}
 
FederatedCredential.init(
   {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    provider: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subject: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize, // Pass the connection instance
    modelName: "FederatedCredentials", // Provide the name of the table
  }
);
 
/**
* Export the model, so that it can be used in any
* page to execute CRUD operations on the app_posts table.
*/
module.exports = FederatedCredential;