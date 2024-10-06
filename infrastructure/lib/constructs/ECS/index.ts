import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { StackProps } from "aws-cdk-lib";
//import * as s3 from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";

/**
 * ECSのプロパティ
 */
export interface ECSProps extends StackProps {
  /**
   * ECSクラスタを作成するVPC
   */
  vpc: ec2.Vpc;
}
/**
 * ECSクラスタ
 */
export class ECS extends Construct {
  //private logBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ECSProps) {
    super(scope, id);

    // ECSクラスタを作成
    const cluster = new ecs.Cluster(this, "EcsCluster", {
      vpc: props.vpc,
      containerInsights: true,
    });

    // Fargateサービスを作成
    //const loadBalancedFargateService =
    new ApplicationLoadBalancedFargateService(this, "Service", {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      },
    });

    //this.logBucket = new s3.Bucket(this, "Bucket", {
    //  removalPolicy: cdk.RemovalPolicy.DESTROY,
    //  autoDeleteObjects: true,
    //  enforceSSL: true,
    //});

    //loadBalancedFargateService.loadBalancer.logAccessLogs(this.logBucket);
  }

  /**
   * NAGのチェックを抑制する
   */
  public addCdkNagSuppressions(parentStack: cdk.Stack) {
    NagSuppressions.addResourceSuppressionsByPath(
      parentStack,
      "/StartCDKStack/ECS/Service/LB/SecurityGroup/Resource",
      [
        {
          id: "AwsSolutions-EC23",
          reason: "Security groups of web services allow large port ranges.",
        },
      ],
    );
    NagSuppressions.addResourceSuppressionsByPath(
      parentStack,
      "/StartCDKStack/ECS/Service/LB/Resource",
      [
        {
          id: "AwsSolutions-ELB2",
          reason: "一時的にALBのアクセスログを無効化",
        },
      ],
    );
    //NagSuppressions.addResourceSuppressions(this.logBucket, [
    //  {
    //    id: "AwsSolutions-S1",
    //    reason: "ロギング用のバケットのアクセスログは不要",
    //  },
    //]);
  }
}