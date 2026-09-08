# ChatbotWpp VM

Projeto separado para rodar em uma VM local, vinculado a outro numero de WhatsApp e conectado a uma IA local/offline.

Por padrao ele usa Ollama, mas tambem deixei suporte para LM Studio.

## Requisitos

- Node.js 20 ou superior
- Ollama instalado e rodando, ou LM Studio com servidor local ativo
- Um celular com WhatsApp para escanear o QR Code

Cada numero de WhatsApp fica preso a uma sessao em disco. Neste projeto a sessao fica em:

```env
AUTH_DIR=auth/chatbotwpp-vm
```

Se criar outro bot depois, use outro `AUTH_DIR` para nao misturar os numeros.

## Usando com Ollama

1. Instale o Ollama: https://ollama.com
2. Baixe um modelo local:

```bash
ollama pull llama3.1
```

3. Entre na pasta do projeto na VM:

```bash
cd chatbotwpp
```

4. Instale as dependencias:

```bash
npm install
```

5. Crie o arquivo `.env`:

```bash
copy .env.example .env
```

6. Rode o bot:

```bash
npm start
```

7. Escaneie o QR Code pelo WhatsApp.

## Rodando direto na VM com PM2

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

## Rodando com Docker Compose

Use Docker Compose se quiser isolar o bot em container:

```bash
docker compose up -d --build
docker exec -it chatbotwpp-ollama ollama pull llama3.1
docker logs -f chatbotwpp-vm
```

O Compose sobe dois containers: `chatbotwpp-vm` para o WhatsApp e `chatbotwpp-ollama` para a IA local. O bot fala com o Ollama em `http://ollama:11434`.

## Audio e transcricao

O bot transcreve audios com Whisper local usando `faster-whisper` dentro do container.

Configuracao no `.env`:

```env
TRANSCRIBE_AUDIO=true
WHISPER_MODEL=tiny
WHISPER_LANGUAGE=pt
TRANSCRIBE_TIMEOUT_MS=120000
```

O primeiro audio pode demorar mais porque o modelo Whisper e baixado e salvo em cache. Depois fica mais rapido.

Para testar se a transcricao esta instalada dentro do container:

```bash
docker exec -it chatbotwpp-vm python3 -c "from faster_whisper import WhisperModel; print('whisper ok')"
```

Se a VM tiver mais memoria/CPU, troque `WHISPER_MODEL=tiny` por `base` para melhorar a precisao.

## Usando com LM Studio

No arquivo `.env`, altere:

```env
AI_PROVIDER=lmstudio
LMSTUDIO_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model
```

Abra o LM Studio, carregue um modelo e ative o servidor local.

## Como conversar

Depois de conectado, envie mensagens para o numero do WhatsApp vinculado nesta VM. O bot responde usando a IA local configurada.

Por seguranca, mensagens de grupos sao ignoradas por padrao no codigo.

## Editando o que o robo sabe sobre a TOPTEC DIGITAL

A identidade, servicos e produtos ficam em:

```bash
knowledge/toptec-digital.md
```

Edite esse arquivo quando quiser mudar textos, incluir produtos, adicionar precos, informar contato oficial ou ajustar como o robo deve atender.

Depois de editar, reinicie o container:

```bash
docker compose restart chatbotwpp
```

A base atual foi montada com as paginas oficiais Home, Servicos, Produtos e Contato do site `https://toptecdigital.com`.
