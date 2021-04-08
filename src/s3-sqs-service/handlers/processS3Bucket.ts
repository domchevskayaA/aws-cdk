import { getObject } from "../../utils/s3-lib";
import { sendMessage } from "../../utils/sqs-lib";

const batchSize = 25;
const queueUrl: string = process.env.QUEUE_URL as string;

const uid = () => Math.random().toString(36).substr(2, 9);

export const s3processor = async (event) => {
    console.log(event, queueUrl, "queueUrl")

    await Promise.all(
        event.Records.map(async record => {
            try {
                const text = await getObject({
                    Bucket: record.s3.bucket.name,
                    Key: record.s3.object.key
                });

                const jsonData = JSON.parse(text.Body?.toString('utf-8') || '');
                const batches = splitToBatches(jsonData);

                await sendToSQS(batches);
            } catch (error) {
                console.error(error);
            }
        })
    )
}

const splitToBatches = (data: any[]) => {
    const batches: any[] = [];

    while (data.length > 0) {
        batches.push(data.splice(0, batchSize))
    }
    return batches;
}

const sendToSQS = async (batches: any[]) => {
    let batchCount = 0;

    await Promise.all(
        batches.map(async item => {
            const items: any[] = [];

            items.push({ ...item, id: uid() });

            try {
                batchCount++;
                console.log("trying batch", batchCount);
                const result = await sendMessage({
                    QueueUrl: queueUrl,
                    MessageBody: JSON.stringify(items)
                });
                console.log("result", result);
            } catch (error) {
                console.error(error);
            }
        })
    )
}