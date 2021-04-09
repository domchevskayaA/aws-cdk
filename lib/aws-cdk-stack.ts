import { RestApi, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { Queue } from '@aws-cdk/aws-sqs';
import { App, StackProps, Stack } from '@aws-cdk/core';
import { S3EventSource} from '@aws-cdk/aws-lambda-event-sources';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Bucket, EventType } from '@aws-cdk/aws-s3';
import { createLambda } from '../utils/lambda';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

const apiDynamodbServiceHandlers = 'src/api-dynamodb-service/handlers';

export class AwsCdkStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'Cocktails', {
      partitionKey: { name: 'name', type: AttributeType.STRING },
    });
    const queue = new Queue(this, 'cocktailsQueue');
    const bucket = new Bucket(this, 'domchevska-aws-cdk-bucket');

    const getAllCocktailLambda = createLambda({
      scope: this,
      id: 'getAllCocktails',
      handler: 'getAllCocktails.getAllCocktails',
      src: apiDynamodbServiceHandlers,
      table,
    });
    const getCocktailByNameLambda = createLambda({
      scope: this,
      id: 'getCocktailByName',
      handler: 'getCocktailByName.getCocktailByName',
      src: apiDynamodbServiceHandlers,
      table,
    });
    const saveCocktailLambda = createLambda({
      scope: this,
      id: 'saveCocktail',
      handler: 'saveCocktail.saveCocktail',
      src: apiDynamodbServiceHandlers,
      table,
    });

    const processS3Lambda = createLambda({
      scope: this,
      id: 'processS3Bucket',
      handler: 'processS3Bucket.processSqsMessage',
      src: 'src/s3-sqs-service/handlers',
      queue,
    });
    const processSQSMessageLambda = createLambda({
      scope: this,
      id: 'processSQSMessage',
      handler: 'processSQSMessage.processSqsMessage',
      src: 'src/sqs-dynamodb-service/handlers',
      queue,
    });

    const restApi = new RestApi(this, 'cocktails-api');

    const cocktails = restApi.root.addResource('cocktails');
    const cocktail = cocktails.addResource('{name}');

    const getAllCocktailsLambdaIntegration = new LambdaIntegration(getAllCocktailLambda);
    const saveCocktailLambdaIntegration = new LambdaIntegration(saveCocktailLambda);
    const getCocktailByNameLambdaIntegration = new LambdaIntegration(getCocktailByNameLambda);

    cocktails.addMethod('GET', getAllCocktailsLambdaIntegration);
    cocktails.addMethod('POST', saveCocktailLambdaIntegration);
    cocktail.addMethod('GET', getCocktailByNameLambdaIntegration);

    processS3Lambda.addEventSource(new S3EventSource(bucket, {
      events: [EventType.OBJECT_CREATED]
    }));

    processSQSMessageLambda.addEventSource(new SqsEventSource(queue));

    bucket.grantReadWrite(processS3Lambda);
  }
}
