#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmberMonolithStack } from '../lib/amber-monolith-stack';
// Descomentar después de la refactorización:
import { AmberDataStack } from '../lib/amber-data-stack';

const app = new cdk.App();
const participantName = app.node.tryGetContext('participantName') || 'default';

new AmberMonolithStack(app, `AmberMonolithStack-${participantName}`, {
  participantName,
});

// Descomentar después de la refactorización:
new AmberDataStack(app, `AmberDataStack-${participantName}`, {
   participantName,
 });

app.synth();
