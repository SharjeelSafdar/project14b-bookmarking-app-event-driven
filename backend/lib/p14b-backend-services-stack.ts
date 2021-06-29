import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as events from "@aws-cdk/aws-events";
import * as eventTargets from "@aws-cdk/aws-events-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEventSource from "@aws-cdk/aws-lambda-event-sources";

import {
  EVENT_SOURCE,
  requestTemplate,
  responseTemplate,
} from "../utils/vtlTemplates";
import { Mutations } from "../utils/types";

export class ServicesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* ******************************************************** */
    /* *************** DynamoDB Table for Todos *************** */
    /* ******************************************************** */
    const bookmarksTable = new ddb.Table(this, "P14bTodosTable", {
      tableName: "P14bTodosTable",
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /* *************************************************** */
    /* *************** AppSync GraphQL API *************** */
    /* *************************************************** */
    const gqlApi = new appsync.GraphqlApi(this, "P14bGraphQlApi", {
      name: "P14b-GraphQL-Api",
      schema: appsync.Schema.fromAsset("utils/graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    /* ********************************************************** */
    /* *************** GraphQL API Query Resolver *************** */
    /* ********************************************************** */
    const ddbDataSource = gqlApi.addDynamoDbDataSource(
      "P14bDdbDataSource",
      bookmarksTable
    );

    ddbDataSource.createResolver({
      typeName: "Query",
      fieldName: "bookmarks",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    /* ************************************************************** */
    /* *************** GraphQL API Mutation Resolvers *************** */
    /* ************************************************************** */
    const httpEventBridgeDS = gqlApi.addHttpDataSource(
      "P14bHttpEventBridgeDS",
      `https://events.${this.region}.amazonaws.com/`, // This is the ENDPOINT for eventbridge.
      {
        name: "p14bHttpEventBridgeDS",
        description: "Sending events to EventBridge on AppSync mutations",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantAllPutEvents(httpEventBridgeDS);

    const createBookmarkArgs = `\\\"title\\\": \\\"$ctx.args.title\\\", \\\"url\\\": \\\"$ctx.args.url\\\"`;
    httpEventBridgeDS.createResolver({
      typeName: "Mutation",
      fieldName: Mutations.CREATE_BOOKMARK,
      requestMappingTemplate: appsync.MappingTemplate.fromString(
        requestTemplate(createBookmarkArgs, Mutations.CREATE_BOOKMARK)
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        responseTemplate()
      ),
    });

    const editBookmarkArgs = `\\\"id\\\": \\\"$ctx.args.id\\\", \\\"title\\\": \\\"$ctx.args.title\\\", \\\"url\\\": \\\"$ctx.args.url\\\"`;
    httpEventBridgeDS.createResolver({
      typeName: "Mutation",
      fieldName: Mutations.EDIT_BOOKMARK,
      requestMappingTemplate: appsync.MappingTemplate.fromString(
        requestTemplate(editBookmarkArgs, Mutations.EDIT_BOOKMARK)
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        responseTemplate()
      ),
    });

    const deleteBookmarkArgs = `\\\"id\\\": \\\"$ctx.args.id\\\"`;
    httpEventBridgeDS.createResolver({
      typeName: "Mutation",
      fieldName: Mutations.DELETE_BOOKMARK,
      requestMappingTemplate: appsync.MappingTemplate.fromString(
        requestTemplate(deleteBookmarkArgs, Mutations.DELETE_BOOKMARK)
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        responseTemplate()
      ),
    });

    const batchDeleteBookmarksArgs = `\\\"ids\\\": \\\"$ctx.args.ids\\\"`;
    httpEventBridgeDS.createResolver({
      typeName: "Mutation",
      fieldName: Mutations.BATCH_DELETE_BOOKMARKS,
      requestMappingTemplate: appsync.MappingTemplate.fromString(
        requestTemplate(
          batchDeleteBookmarksArgs,
          Mutations.BATCH_DELETE_BOOKMARKS
        )
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        responseTemplate()
      ),
    });

    /* ************************************************************ */
    /* *************** GraphQL API None Data Source *************** */
    /* ************************************************************ */
    const appsyncNoneDS = gqlApi.addNoneDataSource("P14bNoneDS", {
      name: "P14bNoneDS",
      description: "Does not save incoming data anywhere",
    });

    appsyncNoneDS.createResolver({
      typeName: "Mutation",
      fieldName: "mutationCompleted",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "payload": $util.toJson($ctx.args)
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        "$util.toJson($context.result)"
      ),
    });

    /* ****************************************************************** */
    /* ********** Lambda Function to Be Invoked By EventBridge ********** */
    /* ****************************************************************** */
    const ddbLambda = new lambda.Function(this, "P14bDdbLambda", {
      functionName: "P14b-Ddb-Lambda",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("utils/lambda/ddbLambda"),
      handler: "index.handler",
      environment: {
        BOOKMARKS_TABLE_NAME: bookmarksTable.tableName,
        STACK_REGION: this.region,
      },
    });
    bookmarksTable.grantReadWriteData(ddbLambda);

    new events.Rule(this, "P14bEventRule", {
      description:
        "Rule to invoke state machine when a mutation is run in AppSync",
      eventPattern: {
        source: [EVENT_SOURCE],
        detailType: [
          Mutations.CREATE_BOOKMARK,
          Mutations.EDIT_BOOKMARK,
          Mutations.DELETE_BOOKMARK,
          Mutations.BATCH_DELETE_BOOKMARKS,
        ],
      },
      targets: [new eventTargets.LambdaFunction(ddbLambda)],
    });

    /* ****************************************************************** */
    /* ********** EventBridge Rule to Invoke the State Machine ********** */
    /* ****************************************************************** */
    const gqlLambda = new lambda.Function(this, "P14bGqlLambda", {
      functionName: "P14b-GQL-Lambda",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("utils/lambda/gqlLambda"),
      handler: "index.handler",
      environment: {
        APPSYNC_GRAPHQL_API_ENDPOINT: gqlApi.graphqlUrl,
        APPSYNC_API_KEY: gqlApi.apiKey as string,
        STACK_REGION: this.region,
      },
    });
    gqlApi.grantMutation(gqlLambda);
    gqlLambda.addEventSource(
      new lambdaEventSource.DynamoEventSource(bookmarksTable, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 1,
      })
    );

    cdk.Tags.of(this).add("Project", "P14b-Bookmarking-App-Event-Driven");
  }
}
