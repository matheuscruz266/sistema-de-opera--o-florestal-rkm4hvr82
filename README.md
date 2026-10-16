# Projeto Criado com o Skip

Este projeto foi criado de ponta a ponta com o [Skip](https://goskip.dev).

## 🚀 Stack Tecnológica

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool extremamente rápida
- **TypeScript** - Superset tipado do JavaScript
- **Shadcn UI** - Componentes reutilizáveis e acessíveis
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento para aplicações React
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de schemas TypeScript-first
- **Recharts** - Biblioteca de gráficos para React

## 📋 Pré-requisitos

- Node.js 18+
- npm

## 🔧 Instalação

```bash
npm install
```

## 💻 Scripts Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start
# ou
npm run dev
```

Abre a aplicação em modo de desenvolvimento em [http://localhost:5173](http://localhost:5173).

### Sincronização com o GitHub

O projeto oferece suporte a duas direções de sincronização com o repositório remoto:

#### 1. PULL: Trazer alterações do remoto do GitHub para o local (recomendado)

Quando você deseja **puxar** o que está no GitHub para sua máquina local sem enviar commits:

```bash
# Executar pull pontual (fetch + pull com rebase seguro e autostash)
npm run git:pull

# Ou deixar um monitor contínuo verificando novidades a cada 30 segundos
npm run git:pull:watch
```

O comando `npm run git:pull`:
- Valida o repositório e a branch `main`.
- Faz `git fetch origin main` para verificar novos commits no remoto.
- Exibe o status claro em português (quantos commits atrás/à frente).
- Se houver novos commits no GitHub, aplica-os na sua cópia local preservando eventuais mudanças locais via `autostash`.
- Caso haja conflitos ou divergências de histórico, exibe instruções amigáveis em português de como resolver sem risco de perda de dados.

#### 2. SYNC / PUSH: Sincronizar alterações locais enviando para o GitHub

Para criar commit automático das alterações locais e enviar (push) para o remoto:

```bash
# Executar sincronização completa (commit + pull + push)
npm run git:sync

# Ou iniciar o watcher automático baseado em alterações de arquivos
npm run git:sync:watch
```

> **Nota sobre Push Protection**: Se o envio (push) for rejeitado pelo GitHub Secret Push Protection por conta de um commit antigo no histórico do repositório remoto, o comando `npm run git:pull` continuará funcionando perfeitamente para puxar as atualizações do remoto sem tentar forçar push.

### Build

```bash
# Build para produção
npm run build

# Build para desenvolvimento
npm run build:dev
```

Gera os arquivos otimizados para produção na pasta `dist/`.

### Preview

```bash
# Visualizar build de produção localmente
npm run preview
```

Permite visualizar a build de produção localmente antes do deploy.

### Linting e Formatação

```bash
# Executar linter
npm run lint

# Executar linter e corrigir problemas automaticamente
npm run lint:fix

# Formatar código com Oxfmt
npm run format
```

## 📁 Estrutura do Projeto

```
.
├── src/              # Código fonte da aplicação
├── public/           # Arquivos estáticos
├── dist/             # Build de produção (gerado)
├── node_modules/     # Dependências (gerado)
└── package.json      # Configurações e dependências do projeto
```

## 🎨 Componentes UI

Este template inclui uma biblioteca completa de componentes Shadcn UI baseados em Radix UI:

- Accordion
- Alert Dialog
- Avatar
- Button
- Checkbox
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Select
- Switch
- Tabs
- Toast
- Tooltip
- E muito mais...

## 📝 Ferramentas de Qualidade de Código

- **TypeScript**: Tipagem estática
- **Oxlint**: Linter extremamente rápido
- **Oxfmt**: Formatação automática de código

## 🔄 Workflow de Desenvolvimento

1. Instale as dependências: `npm install`
2. Inicie o servidor de desenvolvimento: `npm start`
3. Faça suas alterações
4. Verifique o código: `npm run lint`
5. Formate o código: `npm run format`
6. Crie a build: `npm run build`
7. Visualize a build: `npm run preview`

## 📦 Build e Deploy

Para criar uma build otimizada para produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/` e estarão prontos para deploy.
