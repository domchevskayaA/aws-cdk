import { saveInDynamoDb } from './save';

export const processSqsMessage = async (event) => {
    console.log("processSqsMessage lambda event: ", event);

    await Promise.all(
        event.Records.map(async (event) => {
            const items = JSON.parse(event.body);
            console.log(JSON.stringify(items, null, 2));
            await saveInDynamoDb(items, process.env.DYNAMODB_TABLE);
        })
    );
};