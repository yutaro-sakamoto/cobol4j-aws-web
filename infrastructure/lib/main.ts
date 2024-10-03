import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

/**
 * スタック
 */
export class Cobol4JAwsWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ImageBuilder4JQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }

  /**
   * NAGのチェックを抑制する
   */
  public addCdkNagSuppressions() {
    // 必要に応じてNag suppressionsを追加
  }
}
