import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Cobol4JAwsWebStack } from "../lib/main";

const app = new cdk.App();
const stack = new Cobol4JAwsWebStack(app, "StartCDKStack", {
  env: {
    region: "ap-northeast-1",
  },
});
const template = Template.fromStack(stack);

test("No NAT Gateway", () => {
  template.resourcePropertiesCountIs("AWS::EC2::NatGateway", {}, 0);
});

test("Internet Gateway", () => {
  template.resourcePropertiesCountIs("AWS::EC2::InternetGateway", {}, 1);
  template.resourcePropertiesCountIs(
    "AWS::EC2::EgressOnlyInternetGateway",
    {},
    0,
  );
});

test("No ECR Repository", () => {
  template.resourcePropertiesCountIs("AWS::ECR::Repository", {}, 0);
});

test("ECS Cluster", () => {
  template.resourcePropertiesCountIs("AWS::ECS::Cluster", {}, 1);
});
