#!/usr/bin/env python3
"""
Script generador de diagrama de arquitectura AWS para Laboratorio 2
Genera un diagrama usando la librería diagrams (mingrammer) con íconos oficiales de AWS
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.storage import S3
from diagrams.aws.database import Dynamodb
from diagrams.aws.security import IAM
from diagrams.aws.management import Cloudformation

# Configuración del diagrama
# - Título: "Laboratorio 2 - Estado Final"
# - Formato: PNG
# - Dirección: Top to Bottom (TB)
# - show=False: No abre automáticamente el archivo generado
with Diagram(
    "Laboratorio 2 - Estado Final",
    filename="lab-2-validation-troubleshooting/assets/arquitectura-lab2",
    show=False,
    direction="TB",
    outformat="png",
):
    # Cluster 1: AmberMonolithStack
    # Contiene los recursos del Stack monolítico después del Lab 2
    with Cluster("AmberMonolithStack-{participante}"):
        # CloudFormation Stack que gestiona los recursos
        cf_monolith = Cloudformation("CloudFormation\nStack")
        
        # S3 Bucket con nombre autogenerado por CDK
        bucket = S3("S3 Bucket\n(autogenerado)")
        
        # Lambda Function con Node.js 20.x runtime
        lambda_fn = Lambda("amber-hello-\n{participante}\nNode.js 20.x")
        
        # IAM Role para la ejecución de Lambda
        iam_role = IAM("Lambda\nExecution Role")

        # Relaciones entre recursos del Stack monolítico
        # CloudFormation gestiona el Bucket y la Lambda
        cf_monolith >> bucket
        cf_monolith >> lambda_fn
        
        # El IAM Role asume el rol para ejecutar la Lambda
        iam_role >> Edge(label="AssumeRole") >> lambda_fn

    # Cluster 2: AmberDataStack
    # Contiene los recursos del Stack de datos (migrado en Lab 1)
    with Cluster("AmberDataStack-{participante}"):
        # CloudFormation Stack que gestiona los recursos de datos
        cf_data = Cloudformation("CloudFormation\nStack")
        
        # DynamoDB Table con datos de prueba del Lab 1
        dynamodb = Dynamodb("amber-data-\n{participante}\nPK: TEST#001")

        # Relación entre CloudFormation y DynamoDB
        cf_data >> dynamodb
