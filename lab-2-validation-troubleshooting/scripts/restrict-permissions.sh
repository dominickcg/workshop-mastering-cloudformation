#!/bin/bash
# restrict-permissions.sh - Deniega lambda:CreateFunction al rol de despliegue
# Uso: ./scripts/restrict-permissions.sh <nombre-participante>
#
# Referencias oficiales:
# - IAM Deny policies: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_effect.html
# - Lambda permissions: https://docs.aws.amazon.com/lambda/latest/dg/access-control-identity-based.html
# - lambda:CreateFunction action: https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html

set -euo pipefail

PARTICIPANT_NAME="${1:?Error: Debe proporcionar el nombre del participante como primer argumento}"
ROLE_NAME="cdk-hnb659fds-cfn-exec-role-$(aws sts get-caller-identity --query Account --output text)-$(aws configure get region)"

echo "Aplicando política de denegación al rol: ${ROLE_NAME}"

aws iam put-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "DenyLambdaCreate-${PARTICIPANT_NAME}" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Deny",
        "Action": "lambda:CreateFunction",
        "Resource": "*"
      }
    ]
  }'

echo "Política de denegación aplicada exitosamente."
echo "El permiso lambda:CreateFunction ha sido denegado."
