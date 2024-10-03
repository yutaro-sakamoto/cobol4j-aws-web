#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Cobol4JAwsWebStack } from "../lib/main";
import { AwsSolutionsChecks } from "cdk-nag";
import { Aspects } from "aws-cdk-lib";

const app = new cdk.App();
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
const stack = new Cobol4JAwsWebStack(app, "StartCDKStack", {});

// 必要に応じて作成するリソース全体に共通のタグを追加
// cdk.Tags.of(app).add("project", "StartCDKProject");

stack.addCdkNagSuppressions();
