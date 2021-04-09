import { Function, Runtime, Code } from '@aws-cdk/aws-lambda';
import { Stack } from '@aws-cdk/core';
import { Table } from '@aws-cdk/aws-dynamodb';
import { Queue } from '@aws-cdk/aws-sqs';
interface Params {
  scope: Stack;
  id: string;
  handler: string;
  src: string;
  table?: Table;
  queue?: Queue;
};

export const createLambda = (params: Params) => {
  const { scope, id, handler, src, table, queue } = params;
    const lambdaFunction = new Function(scope, id, {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset(src),
      handler: handler,
      environment: {
        DYNAMODB_TABLE: table ? table.tableName : '',
        QUEUE_URL: queue ? queue.queueUrl : ''
      }
    });

    if (table) {
      table.grantReadWriteData(lambdaFunction);
    }

    if (queue) {
      queue.grantSendMessages(lambdaFunction);
    }

    return lambdaFunction;
  }