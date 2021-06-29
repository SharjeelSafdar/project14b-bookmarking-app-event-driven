import * as cdk from "@aws-cdk/core";

export class FrontendDeployStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add("Project", "P14b-Bookmarking-App-Event-Driven");
  }
}
