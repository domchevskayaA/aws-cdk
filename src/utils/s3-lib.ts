import { S3 } from "aws-sdk";

const s3 = new S3();

export const getObject = (params) => s3.getObject(params).promise();