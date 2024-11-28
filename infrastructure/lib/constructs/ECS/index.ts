import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { StackProps } from "aws-cdk-lib";
//import * as s3 from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import * as path from "path";

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
  public readonly dnsName: string;

  constructor(scope: Construct, id: string, props: ECSProps) {
    super(scope, id);

    // ECSクラスタを作成
    const cluster = new ecs.Cluster(this, "EcsCluster", {
      vpc: props.vpc,
      containerInsights: true,
    });
    // カレントディレクトリの絶対パスを取得
    const currentDir = path.resolve(__dirname);

    // tarファイルの絶対パスを計算
    const tarballPath = path.join(
      currentDir,
      "../../../../server/app/cobol4j-aws-web.tar",
    );

    // Fargateサービスを作成
    const albEcsService = new ApplicationLoadBalancedFargateService(
      this,
      "Service",
      {
        cluster,
        taskImageOptions: {
          image: ecs.ContainerImage.fromTarball(tarballPath),
          containerPort: 8080,
        },
        assignPublicIp: false,
        publicLoadBalancer: false,
      },
    );

    this.dnsName = albEcsService.loadBalancer.loadBalancerDnsName;
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
    NagSuppressions.addResourceSuppressionsByPath(
      parentStack,
      "/StartCDKStack/ECS/Service/TaskDef/ExecutionRole/DefaultPolicy/Resource",
      [
        {
          id: "AwsSolutions-IAM5",
          reason: "IAMに関するNAGのチェックを抑制",
        },
      ],
    );
  }
}
