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
| `VITE_CRM_ENDPOINT` | URL do **seu backend/proxy** que recebe o lead (POST JSON) e repassa ao CRM. Tokens do CRM ficam no backend, nunca aqui. |
| `VITE_META_PIXEL_ID` | ID do Pixel. Vazio = eventos desligados. |

Em `npm run dev`, um botão amarelo no canto superior direito mostra o que falta configurar e se o lead foi realmente salvo. Ele não aparece no build de produção.

## Onde editar

- **Copies, perguntas, opções e ícones:** `src/config/quiz.ts`
- **Regras de qualificação:** `src/lib/qualification.ts`
- **Mensagem do WhatsApp:** `src/lib/whatsapp.ts`
- **Payload do CRM:** `src/lib/lead.ts` · **envio:** `src/lib/crm.ts`
- **Pixel:** `src/lib/pixel.ts`

## Integração com o CRM

`POST VITE_CRM_ENDPOINT` com `Content-Type: application/json` e o header `Idempotency-Key: <lead_id>`.
O backend deve responder 2xx somente depois de gravar o lead e deve usar o `lead_id` para não duplicar registros (o usuário pode voltar, editar e reenviar: o `lead_id` é o mesmo). O backend também precisa liberar CORS para o domínio da página, incluindo o header `Idempotency-Key`.

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
| `Lead` | Só depois de o CRM responder 2xx (1x por lead, `eventID = lead_id` para deduplicar com a CAPI) |
| `Contact` | No clique do botão de WhatsApp (1x por lead) |

Nenhum dado pessoal vai nos eventos. Os parâmetros enviados são apenas `content_name`, `content_category` e `lead_quality`.

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
