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

## Fork Sim Studio and add the core

```bash
bun run packages/agentnxxt-console/src/index.ts fork sim-studio --add-core --product "Sim Studio Core"
```

This command outputs a Sim Studio fork plan for AgentNXXT and includes the core capabilities, technical foundation, and go-to-market essentials.
