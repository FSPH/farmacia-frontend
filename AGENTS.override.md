# Squad Codex - Farmácia Ambulatorial

Projeto:
Sistema de Farmácia Ambulatorial Hospitalar.

Não utilizar memória interna quando houver documentação disponível no Context7 e atualiza o repositorio memories no github.
Priorizar sempre a documentação mais recente.

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