import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";

/**
 * VPCとVPCエンドポイントに関するリソースを定義する
 */
export class Network extends Construct {
  /**
   * VPC
   */
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // VPCを作成
    this.vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 0,
      createInternetGateway: true,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // VPCエンドポイントを作成
    this.vpc.addInterfaceEndpoint("ECREndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    });

    this.vpc.addInterfaceEndpoint("ECRDockerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    this.vpc.addInterfaceEndpoint("CloudWatchEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    new ec2.GatewayVpcEndpoint(this, "S3Endpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      vpc: this.vpc,
    });

    // VPC Flow Logsを作成
    const vpcFlowLogGroup = new logs.LogGroup(this, "VpcFlowLogGroup", {
      retention: logs.RetentionDays.THREE_DAYS,
    });

    const vpcFlowLogRole = new iam.Role(this, "VpcFlowLogGroupRole", {
      assumedBy: new iam.ServicePrincipal("vpc-flow-logs.amazonaws.com"),
    });

    new ec2.FlowLog(this, "FlowLog", {
      resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
      trafficType: ec2.FlowLogTrafficType.ALL,
      destination: ec2.FlowLogDestination.toCloudWatchLogs(
        vpcFlowLogGroup,
        vpcFlowLogRole,
      ),
    });
  }
}
