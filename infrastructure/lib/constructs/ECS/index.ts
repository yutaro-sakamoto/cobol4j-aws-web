import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { StackProps } from "aws-cdk-lib";

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
  constructor(scope: Construct, id: string, props: ECSProps) {
    super(scope, id);

    // ECSクラスタを作成
    const cluster = new ecs.Cluster(this, "EcsCluster", {
      vpc: props.vpc,
      containerInsights: true,
    });

    const loadBalancedFargateService =
      new ApplicationLoadBalancedFargateService(this, "Service", {
        cluster,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        cpu: 512,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
        },
      });

    const scalableTarget =
      loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: 1,
        maxCapacity: 2,
      });

    scalableTarget.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    });

    scalableTarget.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent: 50,
    });
  }
}
