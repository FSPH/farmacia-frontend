export function registrarFerramentasRegras(server) {

  server.tool(
    "regras_desenvolvimento",
    "Regras oficiais desenvolvimento projeto",
    {},
    async () => {

      return {
        content: [
          {
            type: "text",
            text: `
REGRA ABSOLUTA BACKEND

O backend é responsabilidade principal é do Usuario.

Nenhum agente deve:
- criar backend
- alterar backend
- refatorar backend
- implementar endpoints
- alterar regras críticas

sem pedido explícito do Usuario.

Frontend:
- React 19
- RSuite
- Tailwind
- Playwright obrigatório

Import obrigatório:
import 'rsuite/dist/rsuite.css'

Playwright:
- obrigatório validar toda alteração frontend

MCPs:
- farmacia
- context7
- playwright
            `.trim(),
          },
        ],
      };

    }
  );

}