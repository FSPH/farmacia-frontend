# Squad Codex - Farmácia Ambulatorial

Projeto:
Sistema de Farmácia Ambulatorial Hospitalar.

## Regra obrigatória para `/compact`

Sempre que o usuário usar ou solicitar `/compact`, o agente deve atualizar a memória versionada do projeto antes de encerrar, compactar ou continuar a sessão.

A memória versionada oficial deste projeto fica em:

```txt
memories/context-summary.md

pasta memories/ é um submódulo Git vinculado ao repositório: git@github.com:FSPH/memories.git

Comandos para atualizar o repositório de memórias
cd /home/ovidio-neto/farmacia/memories
git status
git add context-summary.md
git commit -m "Atualiza resumo de contexto do projeto farmacia"
git push

Depois, se o commit do submódulo mudou, atualizar a referência no repositório principal:
cd /home/ovidio-neto/farmacia
git status
git add memories
git commit -m "Atualiza referência do submódulo memories"
git push

# Uso Obrigatório do Context7

Todos os agentes devem consultar o Context7 antes de:

- criar código novo
- alterar código existente
- refatorar código
- atualizar dependências
- criar testes
- criar componentes
- criar hooks
- criar endpoints
- criar queries
- criar autenticação
- criar integrações

Stack:
- Node.js v24
- Express/Fastify
- MySQL 8.4
- React 19 + Vite
- RSuite CSS
- JWT
- Knex.js
- Zustand

Banco:
- fsph_farmacia
- fsph_ambulatorio (somente leitura)

Agentes:
- Rafael → Arquiteto de Software
- Ana Carolina → Backend Senior
- Gustavo → Frontend Senior
- Marcos → Especialista em MySQL

Fluxo:
1. Rafael define arquitetura e contratos.
2. Ana Carolina implementa backend.
3. Gustavo implementa frontend.

Regras críticas:
- Nunca recriar tabelas.
- Nunca escrever no schema fsph_ambulatorio.
- Toda movimentação de estoque deve usar transaction.
- Requisição só baixa estoque após aprovação.
- Inventário fechado não pode ser reaberto.
- Estoque controlado por depósito + medicamento + lote.