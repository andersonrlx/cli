# infra-cli (boilerplates K8s + Terraform)

## Instalação
```bash
npm install
npm link
```

## Listar templates
```bash
infra templates --type k8s
infra templates --type terraform
```

## Gerar exemplos
```bash
# K8s app básico
infra new --type k8s --template app-basic --outdir ./scaffold --vars '{"name":"api-demo"}'

# Ingress
infra new --type k8s --template ingress-basic --outdir ./scaffold --vars '{"name":"demo.example.com","serviceName":"api-demo","servicePort":80,"namespace":"default"}'

# HPA
infra new --type k8s --template hpa-v2 --outdir ./scaffold --vars '{"name":"api-demo","minReplicas":2,"maxReplicas":5,"cpuTarget":70}'

# App com Config/Secret
infra new --type k8s --template app-with-config --outdir ./scaffold --vars '{"name":"api-pedidos","namespace":"prod","configVal":"production","secretVal":"S3cr3t!"}'

# Terraform ECS Fargate
infra new --type terraform --template aws-ecs-fargate --outdir ./scaffold --vars '{"name":"orders","image":"public.ecr.aws/nginx/nginx:latest","container_port":80,"region":"sa-east-1"}'

# Terraform EKS básico
infra new --type terraform --template aws-eks-basic --outdir ./scaffold --vars '{"name":"sandbox-eks","region":"sa-east-1","desired_size":2}'

# Terraform RDS Postgres
infra new --type terraform --template aws-rds-pg --outdir ./scaffold --vars '{"name":"orders","db_password":"CHANGEME","region":"sa-east-1"}'
```

## Usando repositório Git de templates
```bash
infra use-repo --repo git@github.com:sua-org/boilerplates-infra.git --ref main
```
