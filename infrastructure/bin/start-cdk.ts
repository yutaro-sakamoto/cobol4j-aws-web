#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StartCDKStack } from "../lib/start-cdk";
import { AwsSolutionsChecks } from "cdk-nag";
import { Aspects } from "aws-cdk-lib";

const app = new cdk.App();
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
const stack = new StartCDKStack(app, "StartCDKStack", {});

// 必要に応じて作成するリソース全体に共通のタグを追加
// cdk.Tags.of(app).add("project", "StartCDKProject");

stack.addCdkNagSuppressions();
