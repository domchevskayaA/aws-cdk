import * as lambda from '@aws-cdk/aws-lambda';

export const createLambda = (scope, id, handler, src, table, queue?) => {
    const lambdaFunction = new lambda.Function(scope, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(src),
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