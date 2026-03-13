# AgentNXXT Console

A lightweight console package for bootstrapping AgentNXXT workflows from this monorepo.

## Run

```bash
bun run --cwd packages/agentnxxt-console start
```

## Command

```bash
bun run packages/agentnxxt-console/src/index.ts
```

## Create a SaaS blueprint (NoCodeAgentBuilder)

```bash
bun run packages/agentnxxt-console/src/index.ts scaffold saas --product "Sim Studio SaaS" --builder NoCodeAgentBuilder
```

This command outputs a ready-to-use JSON blueprint for building a SaaS product in AgentNXXT using NoCodeAgentBuilder.
