import { Event, Cocktail } from "../types";
import db from "../../utils/dynamodb-lib";

const table = process.env.DYNAMODB_TABLE as string;

export const getCocktailByName = async (event: Event<Cocktail>) => {
    try {
      const { queryStringParameters } = event;
      if (!queryStringParameters || !queryStringParameters.name) {
        return {
          statusCode: 400,
          body: `Request query should contain name.`
        }
      }
      const resp = await db.query({
        TableName: table,
        KeyConditionExpression: "#name = :name",
        ExpressionAttributeNames: {"#name": "name"},
        ExpressionAttributeValues: { ":name": `${queryStringParameters.name}`}
      });
      return {
        statusCode: 200,
        body: JSON.stringify(resp)
      };
    } catch(error) {
      return {
        statusCode: error.statusCode || 500,
        body: JSON.stringify(error)
      }
    }
};