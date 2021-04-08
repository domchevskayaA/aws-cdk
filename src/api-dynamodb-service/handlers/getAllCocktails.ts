import db from "../../utils/dynamodb-lib";

const table = process.env.DYNAMODB_TABLE as string;

export const getAllCocktails = async () => {
    try {
      const resp = await db.scan({ TableName: table });
      return {
        statusCode: 200,
        body: JSON.stringify(resp)
      }
    } catch(error) {
      return {
        statusCode: error.statusCode || 500,
        body: JSON.stringify(error)
      }
    }
  };