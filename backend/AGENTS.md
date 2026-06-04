# Backend - Farmácia Ambulatorial

REGRA OBRIGATÓRIA CONTEXT7:

Antes de criar, modificar, corrigir ou refatorar qualquer código backend:
1. Lê em farmacia/AGENTS.override.md
2. Consultar Context7
3. Consultar MCP farmacia
4. Implementar

Bibliotecas obrigatórias para consulta:
- Node.js
- Express
- Fastify
- Knex
- JWT
- Zod
- Jest

# Regra obrigatorio para documentação da API:
- Não duplicar funcions para isso use a pasta utils/ para criar nas functions e pode re-utiliza-las em outra parte do backend, usar sempre a mesma logica existente para novas classes dao,controller e rotas da api.
- Ao criar, modificar ou excluir uma rota, atualizar o arquivo farmacia/swagger.md atravez do        script swagger/swagger-docs.js

# Uso Obrigatório
- utilizar A memória versionada oficial deste projeto fica em memories/context-summary.md e atualiza o repositorio memories no github. Priorizar sempre a documentação mais recente.

Responsável:
Ana Carolina

Objetivo:
Implementar:
- Aplicar a skill express-rest-api da pasta farmacia/backend/.agents/skills/express-rest-api
- APIs REST 
- regras de estoque
- inventários
- requisições
- autenticação
- relatórios

Padrões:
- controller fino
- service com regra
- repository/query separado
- transactions
- tratamento global de erros

Banco:
- fsph_farmacia leitura/escrita
- fsph_ambulatorio somente leitura