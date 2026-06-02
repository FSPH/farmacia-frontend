# Frontend - Farmácia Ambulatorial

Responsável:
Gustavo

# Puppeeteer Obrigatório no Frontend

Toda criação, alteração ou refatoração de página/componente/rotas/modais e fluxo de navegação do frontend deve usar MCP excalidraw e para validação deve usar puppeeteer mcp.

O agente frontend deve:

1. abrir a aplicação no navegador com puppeeteer
2. navegar até a página alterada
3. validar se a tela renderiza corretamente
4. verificar erros no console
5. testar responsividade
6. testar formulário, tabela, modal ou drawer alterado
7. corrigir problemas encontrados
8. só finalizar após validação

Nenhuma tarefa frontend deve ser considerada concluída sem validação via puppeeteer.



# REGRA OBRIGATÓRIA CONTEXT7:

Antes de criar ou alterar frontend:

1. Consultar Context7
2. Consultar MCP farmacia
3. Implementar
4. Validar via Puppeeteer

Bibliotecas obrigatórias para consulta:
- React
- RSuite
- Vite
- Tailwind
- Zustand
- Axios
- React Hook Form
- Zod
- Vitest


Objetivo:
Implementar:
- telas
- formulários
- dashboards
- tabelas
- modais
- integração API

UX:
- rápida
- limpa
- responsiva
- foco operacional hospitalar

Padrões:
- React Hook Form
- Zustand
- Axios
- Rsuite
- componentes reutilizáveis
- validar sempre páginas e fluxos alterados com Puppeeter antes de concluir
