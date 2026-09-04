# AUTENTICAÇÃO, AUTORIZAÇÃO E SEGURANÇA

## Autenticação

Amazon Cognito User Pools como Identity Provider.

Capacidades esperadas:
- password;
- MFA;
- OIDC/JWT;
- federação futura;
- passkeys quando necessário.

## Sessão ZENLABS

O navegador não recebe poder de tenant a partir de um campo editável.

Fluxo:

```text
Cognito autentica
   ↓
callback ZENLABS
   ↓
identity verificada
   ↓
ZENLABS cria sessão opaca randômica
   ↓
cookie HttpOnly + Secure + SameSite
   ↓
session hash + user + expiry no PostgreSQL
```

A sessão local permite:
- revogação imediata;
- controle por dispositivo;
- logout global;
- redução da dependência de claims long-lived.

## Autorização

ZENLABS é source-of-truth de:
- tenant membership;
- role;
- object ownership;
- Production Supervisor assignment;
- permission policy.

Cognito **não** decide acesso a um Client/Production/Twin.

## MFA

- obrigatório para staff com acesso interno;
- step-up auth para ações críticas quando necessário;
- política do portal cliente pode evoluir por risco/plano.

## Segredos

- AWS Secrets Manager;
- KMS;
- nunca no repo;
- CI usa GitHub OIDC, não AWS keys long-lived.
