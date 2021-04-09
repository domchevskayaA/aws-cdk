#!/usr/bin/env node
import { App } from '@aws-cdk/core';
import { AwsCdkStack } from '../lib/aws-cdk-stack';

const app = new App();
new AwsCdkStack(app, 'AwsCdkStack');
