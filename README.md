# Quiz de Lojistas — MZ3 Cosméticos (Linha Keratex)

Quiz de qualificação B2B para campanhas Meta Ads. React + TypeScript + Tailwind CSS v4 + Framer Motion + Lucide.

## Rodar

```bash
npm install
cp .env.example .env   # preencha os valores
npm run dev            # http://localhost:5173
npm run build          # gera /dist (site estático)
```

## Configuração (`.env`)

| Variável | Para quê |
|---|---|
| `VITE_WHATSAPP_NUMBER_PI` / `VITE_WHATSAPP_NUMBER_MA` | Opcional. Sobrescreve o WhatsApp de cada estado. Padrão em `src/config/env.ts` (`WHATSAPP_NUMBERS`): **Piauí → 5586993271298**, **Maranhão → 5586995319157**. Ao final, o lead é direcionado ao número do estado que marcou. |
| `VITE_CRM_ENDPOINT_PI` / `VITE_CRM_ENDPOINT_MA` | Opcionais. Sobrescrevem os webhooks por estado. Os webhooks fornecidos já estão configurados em `src/config/env.ts`: **Piauí → Henrique**, **Maranhão → Francisca**. |
| `VITE_CRM_ENDPOINT` | Backend/proxy genérico, usado apenas como fallback para UFs sem webhook estadual. Não substitui os destinos de PI/MA. |
| `FONIL_CRM_TOKEN` | Token do webhook Fonil, lido somente pelo servidor. |
| `VITE_FONIL_PIPELINE_STAGE` | Etapa enviada em `pipeline_stage`, por exemplo `Qualificado`. Vazio omite o campo e preserva o padrão do CRM. |
| `VITE_FONIL_CONSULTANT_PI` / `VITE_FONIL_CONSULTANT_MA` | Nomes dos consultores no CRM. Padrão: Henrique (PI) e Francisca (MA). |
| `VITE_META_PIXEL_ID` | ID do Pixel. Vazio = eventos desligados. |

Em `npm run dev`, um botão amarelo no canto superior direito mostra o que falta configurar e se o lead foi realmente salvo. Ele não aparece no build de produção.

## Onde editar

- **Copies, perguntas, opções e ícones:** `src/config/quiz.ts`
- **Regras de qualificação:** `src/lib/qualification.ts`
- **Mensagem do WhatsApp:** `src/lib/whatsapp.ts`
- **Payload do CRM:** `src/lib/lead.ts` · **envio:** `src/lib/crm.ts`
- **Pixel:** `src/lib/pixel.ts`

## Integração com o CRM

O envio acontece **no final do quiz**, após validar os dados de contato e o consentimento. Cada lead vai, em paralelo, para dois destinos:

1. **Webhook do estado** (payload completo abaixo):
   - **Piauí (`PI`) → webhook do Henrique.**
   - **Maranhão (`MA`) → webhook da Francisca.**
2. **CRM Fonil** (`crm.fonilgroup.com.br`), no formato `{ phone, name, email?, document?, city?, state?, pipeline_stage?, consultant? }`. O webhook do CRM não libera CORS, então o navegador posta em `/api/crm-lead` (mesmo domínio) e o servidor repassa para `POST /api/webhooks/leads/{token}`: o `Caddyfile` em produção e o proxy do `vite.config.ts` em `npm run dev`/`preview`. O token fica no servidor; para trocá-lo, defina `FONIL_CRM_TOKEN` nas variáveis de ambiente do Easypanel (e no `.env` local).

O JSON do Fonil usa os nomes canônicos do contrato, com `phone` (DDD + número, somente dígitos) e `name` obrigatórios. O CNPJ segue em `document` quando preenchido. `consultant` segue o estado: Henrique para PI e Francisca para MA. `pipeline_stage` só é enviado quando configurado. O formulário atual não coleta e-mail; o adaptador aceita `contact.email` quando disponível e omite o campo quando vazio. Não são enviados valores fictícios para campos opcionais.

O lead conta como salvo quando ao menos um destino responde 2xx, mas o evento `Lead` do Pixel/CAPI depende só da confirmação do CRM Fonil.

Selecionar ou trocar o estado não dispara um cadastro incompleto. O envio usa `POST` com `Content-Type: application/json`. O `lead_id` segue no corpo; os webhooks estaduais não recebem o header `Idempotency-Key`, pois o CORS deles não o permite. O backend/proxy genérico mantém esse header quando usado.

O backend deve responder 2xx somente depois de gravar o lead e deve usar o `lead_id` para não duplicar registros (o usuário pode voltar, editar e reenviar: o `lead_id` é o mesmo). Deve liberar CORS para o domínio da página e `Content-Type`. As URLs de captação são públicas no navegador; credenciais privadas de acesso ao CRM ficam no backend.

O payload inclui: contato (nome, empresa, WhatsApp, CNPJ ou `null`), cidade/UF, todas as respostas (id + rótulo), a qualificação (`priority`, `score`, `relationship_tag`, `tags`, `reasons`), o consentimento, as UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`), `fbclid`, a landing page e os horários (`started_at`, `submitted_at` em ISO e `submitted_at_local` no fuso de Fortaleza).

Se o endpoint não estiver configurado ou falhar, o quiz continua até o WhatsApp, a mensagem leva os dados à equipe e a tela final **não** diz que as respostas foram registradas.

## Qualificação (interna, nunca exibida)

- **Alta:** tem estabelecimento, está no PI/MA, já vende produtos capilares e pretende comprar o quanto antes ou em até 7 dias.
- **Média:** tem estabelecimento e está no PI/MA, mas não cumpre todos os critérios da alta.
- **Fora do perfil inicial:** não tem estabelecimento. O lead não é bloqueado e segue para triagem. (O quiz só aceita Piauí e Maranhão.)
- **Tag de relacionamento:** Cliente atual MZ3 · Reativação MZ3 · Novo cliente potencial.
- **Score de 0 a 100** (inclui o volume de compras) para ordenar os leads dentro da mesma prioridade.

## Meta Pixel

| Evento | Quando dispara |
|---|---|
| `PageView` | Ao carregar a página |
| `ViewContent` | Na primeira pergunta (1x por sessão) |
| `Lead` | Só depois de o **CRM Fonil** confirmar o recebimento (HTTP 2xx). O webhook do estado não conta. 1x por lead, `eventID = lead_id` para deduplicar com a CAPI. Se o CRM falhar, a pessoa pode voltar e reenviar: o site tenta de novo só o CRM e, se confirmar, dispara o Lead. |
| `Contact` | No clique do botão de WhatsApp (1x por lead) |

Pixel ID: `4367782926817920`. O código base do Pixel fica **no `index.html`**, para o PageView disparar antes de o app baixar (melhor connect rate); o mesmo ID está em `src/config/env.ts` — se trocar, troque nos dois.

Nenhum dado pessoal vai nos parâmetros dos eventos (apenas `content_name`, `content_category` e `lead_quality`).

### API de Conversões (CAPI)

Todo evento acima também é enviado pelo servidor, com o **mesmo `event_id`** do Pixel para a Meta deduplicar. O navegador posta em `/api/meta-capi` e o Caddy (ou o proxy do Vite em dev) repassa à Graph API acrescentando o token, que **nunca vai ao navegador nem ao Git**.

- **Produção:** defina `META_CAPI_TOKEN` nas variáveis de ambiente do serviço no Easypanel. Sem ela, a CAPI falha e só o Pixel funciona.
- **Local:** coloque `META_CAPI_TOKEN=...` no `.env` (ignorado pelo Git).
- `user_data`: user agent, cookies `_fbp`/`_fbc` e `external_id` (id do lead) em todos os eventos. Em `Lead` e `Contact` vão também telefone, nome, sobrenome, cidade, UF e país, normalizados e com hash SHA-256.
- Para testar no Gerenciador de Eventos, veja a aba "Eventos de teste" / "Visão geral" do pixel: os eventos do servidor aparecem como "Servidor" e os do navegador como "Navegador".

## Observações

- As respostas ficam no `sessionStorage` da aba, então recarregar a página não apaga nada e fechar a aba limpa tudo.
- O botão "voltar" do celular volta uma etapa em vez de sair do quiz, e as UTMs da URL são mantidas.
- O CNPJ aceita o formato numérico e o novo formato alfanumérico da Receita Federal.
- A ilustração da abertura é abstrata (gota e anéis da marca). Nenhuma embalagem oficial foi recriada. As logos MZ3 e Keratex em `public/brand/` vêm do site oficial; a logo DEC Rio Piranhas (parceira) foi recortada de `src/assets/Logo Rio Piranhas.png`.

## Deploy (Easypanel / Nixpacks)

- Node 22 é fixado em `package.json` (`engines`) e `.nvmrc`, porque o Tailwind v4 exige Node 20 ou superior.
- O provider Vite do Nixpacks instala o Caddy automaticamente na fase `caddy`. Não adicione `caddy` em `phases.setup.nixPkgs`: isso instala versões de snapshots Nix diferentes e causa conflito em `caddy-api.service`.
- `nixpacks.toml` roda `npm ci` e `npm run build`, e inicia o servidor com o `Caddyfile` do projeto. Mantenha a detecção automática habilitada (não defina `NIXPACKS_SPA_CADDY=false` no Easypanel).
- O `Caddyfile` serve **somente `/app/dist`**, com o MIME correto, cache longo para `/assets/*`, `no-cache` no `index.html` e fallback para o `index.html`.
- Variáveis `VITE_*` são lidas no momento do build: configure-as no Easypanel e faça um novo deploy sempre que alterá-las.
