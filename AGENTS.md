# Frontend - Farmácia Ambulatorial

Responsável:
Gustavo

# Obrigatório no Frontend

Toda criação, alteração ou refatoração de página/componente/rotas/modais e fluxo de navegação do frontend deve usar skill ui-ux-pro-max presente em farmacia/.agents/skills/ e para validação deve usar chrome-dev-tools + puppeeteer mcp.

O agente frontend deve:
 
 observaçõa: gere pouco context no prompt se possivel

1. abrir a aplicação no navegador com puppeeteer + chrome-dev-tools
2. navegar até a página alterada
3. validar se a tela renderiza corretamente
4. verificar erros no console
5. testar responsividade
6. testar formulário, tabela, modal ou drawer alterado
7. corrigir problemas encontrados
8. só finalizar após validação via puppeeteer + chrome-dev-tools sem gerar screenshots.

# REGRA OBRIGATÓRIA CONTEXT7:

Antes de criar ou alterar frontend Consultar Context7

Bibliotecas obrigatórias para consulta:
- React
- RSuite
- Vite
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
- validar sempre páginas e fluxos alterados
