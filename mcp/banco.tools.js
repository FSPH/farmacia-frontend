export function registrarFerramentasBanco(server) {
  server.tool(
    "listar_schemas",
    "Lista schemas do projeto",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Schemas:

1. fsph_farmacia
- leitura e escrita

2. fsph_ambulatorio
- somente leitura
- acesso à tb_pacientes
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "listar_tabelas_principais",
    "Lista tabelas principais do sistema",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Tabelas principais:

- tb_medicamentos
- tb_estoque
- tb_entradas
- tb_requisicoes
- tb_inventarios
- tb_itens_inventario
- tb_depositos
- tb_locais
- tb_boname
- tb_diagnosticos
- tb_tipos_medicamentos
            `.trim(),
          },
        ],
      };
    }
  );

  server.tool(
    "regras_banco_legado",
    "Explica regras do banco legado",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `
Regras banco legado:

- nunca recriar tabelas
- nunca usar sync automático ORM
- charset utf8mb4
- usar nomes reais do banco
- respeitar chaves compostas
- não alterar fsph_ambulatorio
            `.trim(),
          },
        ],
      };
    }
  );
}