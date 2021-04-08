import * as api from '@aws-cdk/aws-apigateway';
import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import * as  eventSource from '@aws-cdk/aws-lambda-event-sources';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import { createLambda } from '../utils/lambda';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

const S3EventSource = eventSource.S3EventSource;
const apiDynamodbServiceHandlers = 'src/api-dynamodb-service/handlers';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Cocktails', {
      partitionKey: { name: 'name', type: dynamodb.AttributeType.STRING },
    });
    const queue = new sqs.Queue(this, 'cocktailsQueue');
    const bucket = new s3.Bucket(this, 'rgederin-aws-cdk-bucket');

    const getAllCocktailLambda = createLambda(this, 'getAllCocktails', 'getAllCocktails.getAllCocktails', apiDynamodbServiceHandlers, table);
    const getCocktailByNameLambda = createLambda(this, 'getCocktailByName', 'getCocktailByName.getCocktailByName', apiDynamodbServiceHandlers, table);
    const saveCocktailLambda = createLambda(this, 'saveCocktail', 'saveCocktail.saveCocktail', apiDynamodbServiceHandlers, table);

    const processS3Lambda = createLambda(this, 'processS3Bucket', 'processS3Bucket.processSqsMessage', 'src/s3-sqs-service/handlers', undefined, queue);
    const processSQSMessageLambda = createLambda(this, 'processSQSMessage', 'processSQSMessage.processSqsMessage', 'src/sqs-dynamodb-service/handlers', undefined, queue);

    const restApi = new api.RestApi(this, 'cocktails-api');

    const cocktails = restApi.root.addResource('cocktails');
    const cocktail = cocktails.addResource('{name}');

    const getAllCocktailsLambdaIntegration = new api.LambdaIntegration(getAllCocktailLambda);
    const saveCocktailLambdaIntegration = new api.LambdaIntegration(saveCocktailLambda);
    const getCocktailByNameLambdaIntegration = new api.LambdaIntegration(getCocktailByNameLambda);

    cocktails.addMethod('GET', getAllCocktailsLambdaIntegration);
    cocktails.addMethod('POST', saveCocktailLambdaIntegration);
    cocktail.addMethod('GET', getCocktailByNameLambdaIntegration);

    processS3Lambda.addEventSource(new S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED]
    }));

    processSQSMessageLambda.addEventSource(new SqsEventSource(queue));

    bucket.grantReadWrite(processS3Lambda);
  }
}
