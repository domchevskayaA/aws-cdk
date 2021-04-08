import { SQS } from "aws-sdk";

const sqs = new SQS({ apiVersion: "2012-11-05" });

export const sendMessage = (params) => sqs.sendMessage(params).promise();