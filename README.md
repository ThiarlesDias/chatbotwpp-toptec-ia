# ChatbotWpp TOPTEC IA

Projeto separado para rodar em uma VM local, vinculado a outro numero de WhatsApp e conectado a uma IA local/offline.

Por padrao ele usa Ollama, mas tambem tem suporte para LM Studio.

## O que o bot faz

- Atende conversas individuais do WhatsApp.
- Ignora grupos.
- Usa o nome de exibicao do contato quando o WhatsApp informa.
- Se apresenta como Charlie, robo da TOPTEC DIGITAL.
- Responde sobre os servicos e produtos oficiais da TOPTEC DIGITAL.
- Encaminha pedidos de orcamento para o admin configurado.
- Transcreve audio localmente com Whisper dentro do container.
- Mantem memoria curta por contato para entender respostas como "sim", "quero" e "fala mais".

## Base da TOPTEC DIGITAL

A base comercial fica em:

```bash
knowledge/toptec-digital.md
```

Ela foi montada com as paginas oficiais:

- https://toptecdigital.com
- https://toptecdigital.com/servicos/
- https://toptecdigital.com/produtos/
- https://toptecdigital.com/clientes/
- https://toptecdigital.com/contato/

Quando mudar servico, produto, preco, horario, Instagram ou telefone, atualize esse arquivo e reinicie o container.

## Requisitos

- Docker e Docker Compose na VM.
- Um celular com WhatsApp para escanear o QR Code.

Se for rodar sem Docker:

- Node.js 20 ou superior.
- Ollama instalado e rodando, ou LM Studio com servidor local ativo.

Cada numero de WhatsApp fica preso a uma sessao em disco. Neste projeto a sessao fica em:

```env
AUTH_DIR=auth/chatbotwpp-vm
```

Se criar outro bot depois, use outro `AUTH_DIR` para nao misturar numeros.

## Configuracao

Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configuracoes principais:

```env
BOT_NAME=Robo TOPTEC DIGITAL
BOT_DISPLAY_NAME=Charlie
COMPANY_NAME=TOPTEC DIGITAL
OFFICIAL_PHONE=43991939187
ADMIN_PHONE=43999612132
ACTIVE_ROBOT_PHONE=43991939187
SITE_URL=https://toptecdigital.com
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:1b
TRANSCRIBE_AUDIO=true
WHISPER_MODEL=base
```

## Rodando com Docker Compose

```bash
cd ~/chatbotwpp
docker compose up -d --build
docker exec -it chatbotwpp-ollama ollama pull llama3.2:1b
docker logs -f chatbotwpp-vm
```

O Compose sobe dois containers:

- `chatbotwpp-vm`: bot do WhatsApp.
- `chatbotwpp-ollama`: IA local.

O bot fala com o Ollama em `http://ollama:11434`.

## Atualizando na VM pelo Git

```bash
cd ~/chatbotwpp
git pull
docker compose up -d --build
docker exec -it chatbotwpp-ollama ollama pull llama3.2:1b
docker logs -f chatbotwpp-vm
```

Se trocar numero de WhatsApp ou quiser limpar a sessao:

```bash
docker compose down
rm -rf auth/chatbotwpp-vm
docker compose up -d --build
docker logs -f chatbotwpp-vm
```

## Validacao local

Antes de subir para a VM, rode:

```bash
npm test
npm run check
```

Para validar a transcricao dentro do container:

```bash
docker exec -it chatbotwpp-vm python3 -c "from faster_whisper import WhisperModel; print('whisper ok')"
```

O primeiro audio pode demorar mais porque o modelo Whisper e baixado e salvo em cache. Depois tende a ficar mais rapido.

Se a VM ficar lenta, troque `WHISPER_MODEL=base` por `tiny` no `.env` para reduzir consumo, com menor precisao.

## Roteiro de testes no WhatsApp

Envie mensagens como:

```text
oi
quem e voce?
o que voces fazem?
voces fazem site?
quero robo para whatsapp
servico do whats
whats
sim
apenas responder
sistema de estoque
produtos
quanto custa um site?
falar com atendente
```

Teste tambem com erros comuns de digitacao:

```text
qem e vc?
serviso do wats
voces fais saite?
sistema de estoki
qero orsamento de saite
falar com atedente
quero markting
```

Teste tambem audio dizendo:

```text
oi toptec digital
quero saber sobre sistema de estoque
quero automatizar meu whatsapp
```

O esperado e que o bot:

- Responda usando o nome do contato.
- Diga que e o Charlie, robo da TOPTEC DIGITAL, quando perguntarem.
- Liste servicos oficiais sem inventar.
- Pergunte dados para orcamento sem passar preco fechado.
- Use o assunto anterior quando o cliente responder "sim".
- Peca confirmacao se o audio ficar confuso.

## Rodando sem Docker

```bash
npm install
ollama pull llama3.2:1b
npm start
```

Para PM2:

```bash
npm install -g pm2
npm run pm2:start
pm2 logs chatbotwpp-vm
pm2 save
```

Para parar:

```bash
npm run pm2:stop
```

## Usando com LM Studio

No `.env`, altere:

```env
AI_PROVIDER=lmstudio
LMSTUDIO_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model
```

Abra o LM Studio, carregue um modelo e ative o servidor local.
