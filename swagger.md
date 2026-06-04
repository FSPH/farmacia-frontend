# Swagger - Farmacia Ambulatorial

Documentacao gerada automaticamente a partir das rotas Express do backend.

- Gerado em: 2026-06-04T14:01:05.061Z
- OpenAPI: 3.0.3

## Visao Geral

- Titulo: Farmacia Ambulatorial API
- Versao: 1.0.0
- Base URL local: http://localhost:3000
- Autenticacao: header `Authorization: Bearer <token>` quando a autenticacao estiver habilitada.

## Endpoints

### Boname

#### GET /parametros/boname/buscar/{bona_id}

- Resumo: GET parametros boname buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| bona_id | path | sim | string | Parametro de rota bona_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### DELETE /parametros/boname/excluir/{bona_id}

- Resumo: DELETE parametros boname excluir
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| bona_id | path | sim | string | Parametro de rota bona_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/boname/listar_ativos/{pesq}

- Resumo: GET parametros boname listar ativos
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/boname/listar/{pesq}

- Resumo: GET parametros boname listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /parametros/boname/salvar

- Resumo: POST parametros boname salvar
- Request body: sim

##### Payload

- `bona_id`: integer, opcional. ID do Boname. Use 0 para criar um novo registro.
- `bona_codigo`: string, obrigatorio. Codigo do Boname.
- `bona_descr`: string, obrigatorio. Descricao do Boname.
- `bona_qt_ui`: integer, obrigatorio. Quantidade por unidade.
- `bona_diag_id`: integer, obrigatorio. ID do diagnostico relacionado.
- `bona_ativo`: integer (0, 1), obrigatorio. Indicador de status ativo.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Depositos

#### GET /parametros/depositos/buscar/{dep_id}

- Resumo: GET parametros depositos buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| dep_id | path | sim | string | Parametro de rota dep_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### DELETE /parametros/depositos/excluir/{dep_id}

- Resumo: DELETE parametros depositos excluir
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| dep_id | path | sim | string | Parametro de rota dep_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/depositos/listar/{pesq}

- Resumo: GET parametros depositos listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /parametros/depositos/salvar

- Resumo: POST parametros depositos salvar
- Request body: sim

##### Payload

- `dep_id`: integer, opcional. ID do deposito. Use 0 para criar um novo registro.
- `dep_descr`: string, obrigatorio. Descricao do deposito.
- `dep_ativo`: integer (0, 1), obrigatorio. Indicador de status ativo.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Diagnosticos

#### GET /parametros/diagnosticos/buscar/{diag_id}

- Resumo: GET parametros diagnosticos buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| diag_id | path | sim | string | Parametro de rota diag_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### DELETE /parametros/diagnosticos/excluir/{diag_id}

- Resumo: DELETE parametros diagnosticos excluir
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| diag_id | path | sim | string | Parametro de rota diag_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/diagnosticos/listar_ativos/{pesq}

- Resumo: GET parametros diagnosticos listar ativos
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/diagnosticos/listar/{pesq}

- Resumo: GET parametros diagnosticos listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /parametros/diagnosticos/salvar

- Resumo: POST parametros diagnosticos salvar
- Request body: sim

##### Payload

- `diag_id`: integer, opcional. ID do diagnostico. Use 0 para criar um novo registro.
- `diag_descr`: string, obrigatorio. Descricao do diagnostico.
- `diag_ativo`: integer (0, 1), obrigatorio. Indicador de status ativo.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Entradas

#### GET /entradas/buscar/{ent_id}

- Resumo: GET entradas buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| ent_id | path | sim | string | Parametro de rota ent_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /entradas/listar/{pesq}/{data_inicio}/{data_fim}

- Resumo: GET entradas listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| data_inicio | path | sim | string | Parametro de rota data_inicio. |
| data_fim | path | sim | string | Parametro de rota data_fim. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /entradas/salvar

- Resumo: POST entradas salvar
- Request body: sim

##### Payload

- `ent_date`: string, obrigatorio. Data da entrada.
- `ent_med_id`: integer, obrigatorio. ID do medicamento.
- `ent_lote`: string, obrigatorio. Lote da entrada.
- `ent_qtde`: number, obrigatorio. Quantidade recebida.
- `ent_doc`: string, obrigatorio. Documento fiscal ou referencia da entrada.
- `ent_fornecido_por`: string, obrigatorio. Nome do fornecedor.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Locais

#### GET /parametros/locais/buscar/{id_local}

- Resumo: GET parametros locais buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| id_local | path | sim | string | Parametro de rota id_local. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### DELETE /parametros/locais/excluir/{local_id}

- Resumo: DELETE parametros locais excluir
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| local_id | path | sim | string | Parametro de rota local_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/locais/listar/{pesq}

- Resumo: GET parametros locais listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /parametros/locais/salvar

- Resumo: POST parametros locais salvar
- Request body: sim

##### Payload

- `local_id`: integer, obrigatorio. ID do local.
- `local_descr`: string, obrigatorio. Descricao do local.
- `local_ativo`: integer (0, 1), obrigatorio. Indicador de status ativo.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Medicamentos

#### GET /parametros/medicamentos/buscar/{med_id}

- Resumo: GET parametros medicamentos buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| med_id | path | sim | string | Parametro de rota med_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### DELETE /parametros/medicamentos/excluir/{med_id}

- Resumo: DELETE parametros medicamentos excluir
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| med_id | path | sim | string | Parametro de rota med_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/medicamentos/listar/{pesq}

- Resumo: GET parametros medicamentos listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /parametros/medicamentos/salvar

- Resumo: POST parametros medicamentos salvar
- Request body: sim

##### Payload

- `med_id`: integer, obrigatorio. ID do medicamento.
- `med_descr`: string, obrigatorio. Descricao principal do medicamento.
- `med_descr_coml`: string, obrigatorio. Descricao comercial.
- `med_und`: string, obrigatorio. Unidade de medida.
- `med_tipo_codigo`: string, obrigatorio. Codigo do tipo de medicamento.
- `med_tipo_med`: string, obrigatorio. Categoria ou tipo do medicamento.
- `med_max`: number, obrigatorio. Estoque maximo sugerido.
- `med_min`: number, obrigatorio. Estoque minimo sugerido.
- `med_ui_cx`: number, obrigatorio. Unidades internas por caixa.
- `med_bona_codigo`: string, obrigatorio. Codigo Boname relacionado.
- `med_alert`: integer, obrigatorio. Indicador de alerta do medicamento.
- `med_diag_id`: integer, obrigatorio. ID do diagnostico relacionado.
- `med_ativo`: integer (0, 1), obrigatorio. Indicador de status ativo.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Requisicoes

#### GET /requisicoes/aprovar_por_requisicao/{req_id}/{user_aprova}

- Resumo: GET requisicoes aprovar por requisicao
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| req_id | path | sim | string | Parametro de rota req_id. |
| user_aprova | path | sim | string | Parametro de rota user_aprova. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /requisicoes/buscar/{req_id}

- Resumo: GET requisicoes buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| req_id | path | sim | string | Parametro de rota req_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /requisicoes/listar/{dat_ini}/{dat_fim}/{aprova}

- Resumo: GET requisicoes listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| dat_ini | path | sim | string | Parametro de rota dat_ini. |
| dat_fim | path | sim | string | Parametro de rota dat_fim. |
| aprova | path | sim | string | Parametro de rota aprova. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /requisicoes/salvar

- Resumo: POST requisicoes salvar
- Request body: sim

##### Payload

- `req_id`: integer, obrigatorio. ID da requisicao.
- `req_data`: string, obrigatorio. Data da requisicao.
- `req_med_id`: integer, obrigatorio. ID do medicamento.
- `req_pac_id`: integer, obrigatorio. ID do paciente.
- `req_qtde`: number, obrigatorio. Quantidade requisitada.
- `req_lote`: string, obrigatorio. Lote do item requisitado.
- `req_val_mes`: integer, obrigatorio. Mes de validade do lote.
- `req_val_ano`: integer, obrigatorio. Ano de validade do lote.
- `req_dep_id`: integer, obrigatorio. ID do deposito.
- `req_local_id`: integer, obrigatorio. ID do local solicitante.
- `req_tipo`: string, obrigatorio. Tipo da requisicao.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

### Tipos Produtos

#### GET /parametros/tipos_produtos/buscar-codigo/{tipo_codigo}

- Resumo: GET parametros tipos produtos buscar-codigo
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| tipo_codigo | path | sim | string | Parametro de rota tipo_codigo. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/tipos_produtos/buscar/{tipo_id}

- Resumo: GET parametros tipos produtos buscar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| tipo_id | path | sim | string | Parametro de rota tipo_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### DELETE /parametros/tipos_produtos/excluir/{tipo_id}

- Resumo: DELETE parametros tipos produtos excluir
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| tipo_id | path | sim | string | Parametro de rota tipo_id. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### GET /parametros/tipos_produtos/listar/{pesq}

- Resumo: GET parametros tipos produtos listar
- Request body: nao

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| pesq | path | sim | string | Parametro de rota pesq. |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

#### POST /parametros/tipos_produtos/salvar

- Resumo: POST parametros tipos produtos salvar
- Request body: sim

##### Payload

- `tipo_id`: integer, obrigatorio. ID do tipo de produto.
- `tipo_codigo`: string, obrigatorio. Codigo do tipo de produto.
- `tipo_descr`: string, obrigatorio. Descricao do tipo de produto.
- `tipo_ativo`: integer (0, 1), obrigatorio. Indicador de status ativo.

##### Parametros

| Nome | Local | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- | --- |
| Authorization | header | nao | string | Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente. |

##### Respostas

| Status | Descricao |
| --- | --- |
| 200 | Sucesso |
| 400 | Requisicao invalida |
| 401 | Nao autenticado |
| 404 | Recurso nao encontrado |
| 500 | Erro interno |

## Schemas

### ApiResponse

```json
{
  "type": "object",
  "properties": {
    "err": {
      "type": "integer",
      "example": 0
    },
    "msg": {
      "type": "string",
      "example": "OK"
    },
    "status": {
      "type": "integer",
      "example": 200
    },
    "data": {
      "oneOf": [
        {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": true
          }
        },
        {
          "type": "object",
          "additionalProperties": true
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "err",
    "msg",
    "status",
    "data"
  ]
}
```

### ErrorResponse

```json
{
  "type": "object",
  "properties": {
    "err": {
      "type": "integer",
      "example": 500
    },
    "msg": {
      "type": "string",
      "example": "Erro interno do servidor."
    },
    "status": {
      "type": "integer",
      "example": 500
    },
    "data": {
      "oneOf": [
        {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": true
          }
        },
        {
          "type": "object",
          "additionalProperties": true
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "err",
    "msg",
    "status",
    "data"
  ]
}
```

