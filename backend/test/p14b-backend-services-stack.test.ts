import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as P14bBackendServices from '../lib/p14b-backend-services-stack';

const createTestStack = (app: cdk.App) =>
  new P14bBackendServices.ServicesStack(app, "MyTestStack");

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = createTestStack(app);
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT));
});
