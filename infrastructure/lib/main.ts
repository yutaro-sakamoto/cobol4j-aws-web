import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Network } from "./constructs/Network";

/**
 * スタック
 */
export class Cobol4JAwsWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Network(this, "Network");
  }

  /**
   * NAGのチェックを抑制する
   */
  public addCdkNagSuppressions() {
    // 必要に応じてNag suppressionsを追加
  }
}
