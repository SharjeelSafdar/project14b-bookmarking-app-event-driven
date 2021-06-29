import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as P14bFrontendDeploy from '../lib/p14b-frontend-deploy-stack';

const createTestStack = (app: cdk.App) =>
  new P14bFrontendDeploy.FrontendDeployStack(app, "MyTestStack");

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = createTestStack(app);
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT));
});
