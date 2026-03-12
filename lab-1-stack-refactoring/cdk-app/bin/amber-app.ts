#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmberMonolithStack } from '../lib/amber-monolith-stack';
import { AmberDataStack } from '../lib/amber-data-stack';

const app = new cdk.App();
const participantName = app.node.tryGetContext('participantName') || 'default';

// Configuración de entorno para usar credenciales del perfil AWS
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new AmberMonolithStack(app, `AmberMonolithStack-${participantName}`, {
  participantName,
  env,
});

new AmberDataStack(app, `AmberDataStack-${participantName}`, {
  participantName,
  env,
});

app.synth();
