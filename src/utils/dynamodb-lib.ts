import { DynamoDB } from "aws-sdk";

const db = new DynamoDB.DocumentClient();

export default {
    get: (params) => db.get(params).promise(),
    query: (params) => db.query(params).promise(),
    scan: (params) => db.scan(params).promise(),
    put: (params) => db.put(params).promise(),
    delete: (params) => db.delete(params).promise(),
    batchWrite: (params) => db.batchWrite(params).promise()
};