import { Event, Cocktail } from "../types";
import { uid } from "../../utils/uid";
import db from "../../utils/dynamodb-lib";

const table = process.env.DYNAMODB_TABLE as string;

export const saveCocktail = async (event: Event<Cocktail>) => {
    try {
      if (!event || !event.body) {
        return {
          statusCode: 400,
          message: "Request body can't be empty.",
        }
      }
      const data = event.body ? JSON.parse(event.body) : event;
      const { name, taste, alcohol, size, liquor } = data;
  
      if (!name || !taste || !alcohol || !size || !liquor) {
        return {
          statusCode: 400,
          body: `Request body should contain following properties: "name", "taste", "alcohol", "size", "liquor".`
        }
      }
  
      const item = { ...data, id: uid() };
      await db.put({
        TableName: table,
        Item: item
      })
      return {
        statusCode: 201,
        body: JSON.stringify({ Item: item })
      }
    } catch (error) {
      console.log(error, 'error');
        return {
          statusCode: error.statusCode || 500,
          body: JSON.stringify(error)
        }
    }    
};
  