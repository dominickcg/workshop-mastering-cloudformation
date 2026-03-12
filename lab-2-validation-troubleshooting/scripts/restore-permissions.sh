#!/bin/bash
# restore-permissions.sh - Restaura permisos eliminando la política de denegación
# Uso: ./scripts/restore-permissions.sh <nombre-participante>
#
# Referencias oficiales:
# - IAM inline policies: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html
# - delete-role-policy CLI: https://docs.aws.amazon.com/cli/latest/reference/iam/delete-role-policy.html

set -euo pipefail

PARTICIPANT_NAME="${1:?Error: Debe proporcionar el nombre del participante como primer argumento}"
ROLE_NAME="cdk-hnb659fds-cfn-exec-role-$(aws sts get-caller-identity --query Account --output text)-$(aws configure get region)"

echo "Eliminando política de denegación del rol: ${ROLE_NAME}"

aws iam delete-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-name "DenyLambdaCreate-${PARTICIPANT_NAME}"

echo "Política de denegación eliminada exitosamente."
echo "Los permisos han sido restaurados."
