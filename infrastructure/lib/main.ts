import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Network } from "./constructs/Network";
//import { ECS } from "./constructs/ECS";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { NagSuppressions } from "cdk-nag";

/**
 * スタック
 */
export class Cobol4JAwsWebStack extends cdk.Stack {
  //private ecsCluster: ECS;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const network = new Network(this, "Network");

    //this.ecsCluster = new ECS(this, "ECS", {
    //  vpc: network.vpc,
    //});
    //const vpc = new ec2.Vpc(this, "MyVpc", { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: network.vpc,
      containerInsights: true,
    });

    // Instantiate Fargate Service with just cluster and image
    new ApplicationLoadBalancedFargateService(this, "FargateService", {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      },
    });
  }

  /**
   * NAGのチェックを抑制する
   */
  public addCdkNagSuppressions() {
    //this.ecsCluster.addCdkNagSuppressions(this);
    //NagSuppressions.addResourceSuppressionsByPath(
    //  this,
    //  "/StartCDKStack/MyVpc/Resource",
    //  [
    //    {
    //      id: "AwsSolutions-VPC7",
    //      reason: "VPC Flow Logsを作成していない",
    //    },
    //  ],
    //);
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      "/StartCDKStack/FargateService/LB/SecurityGroup/Resource",
      [
        {
          id: "AwsSolutions-EC23",
          reason: "Security groups of web services allow large port ranges.",
        },
      ],
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      "/StartCDKStack/FargateService/LB/Resource",
      [
        {
          id: "AwsSolutions-ELB2",
          reason: "一時的にALBのアクセスログを無効化",
        },
      ],
    );
  }
}
