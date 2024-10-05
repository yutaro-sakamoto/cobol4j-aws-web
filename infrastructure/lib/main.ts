import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Network } from "./constructs/Network";
import { ECS } from "./constructs/ECS";

/**
 * スタック
 */
export class Cobol4JAwsWebStack extends cdk.Stack {
  private ecsCluster: ECS;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const network = new Network(this, "Network");

    this.ecsCluster = new ECS(this, "ECS", {
      vpc: network.vpc,
    });
  }

  /**
   * NAGのチェックを抑制する
   */
  public addCdkNagSuppressions() {
    this.ecsCluster.addCdkNagSuppressions(this);
  }
}
