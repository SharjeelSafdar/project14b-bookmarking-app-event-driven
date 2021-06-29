import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as P14bBackendServices from "../lib/p14b-backend-services-stack";

const createTestStack = (app: cdk.App) =>
  new P14bBackendServices.ServicesStack(app, "MyTestStack");

test("Stack has a DynamoDB Table with DynamoDB Streams Enabled", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::DynamoDB::Table", {
      StreamSpecification: {
        StreamViewType: "NEW_AND_OLD_IMAGES",
      },
    })
  );
});

test("Stack has an AppSync GraphQL API", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(haveResource("AWS::AppSync::GraphQLApi"));
});

test("Stack has an AppSync GraphQL Schema", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(haveResource("AWS::AppSync::GraphQLSchema"));
});

test("GraphQL API has a DynamoDB Data Source", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::AppSync::DataSource", {
      Type: "AMAZON_DYNAMODB",
    })
  );
});

test("GraphQL API has an HTTP Data Source", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::AppSync::DataSource", {
      Type: "HTTP",
    })
  );
});

test("GraphQL API has a None Data Source", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::AppSync::DataSource", {
      Type: "NONE",
    })
  );
});

test("Stack has a Lambda Function for DynamoDB", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::Lambda::Function", {
      FunctionName: "P14b-Ddb-Lambda",
    })
  );
});

test("Stack has an Event Rule to Invoke DdbLambda", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::Events::Rule", {
      EventPattern: {
        source: ["p14b-appsync-api"],
        "detail-type": [
          "createBookmark",
          "editBookmark",
          "deleteBookmark",
          "batchDeleteBookmarks",
        ],
      },
    })
  );
});

test("Stack has a Lambda Function for GraphQL Mutation", () => {
  const app = new cdk.App();
  // WHEN
  const stack = createTestStack(app);
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::Lambda::Function", {
      FunctionName: "P14b-GQL-Lambda",
    })
  );
});
