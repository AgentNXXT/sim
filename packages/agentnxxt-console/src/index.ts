#!/usr/bin/env bun

type BuilderType = "NoCodeAgentBuilder" | "Custom";

type SaaSBlueprint = {
  productName: string;
  platform: "AgentNXXT";
  builder: BuilderType;
  coreModules: string[];
  monetization: string[];
  launchChecklist: string[];
};

type ForkPlan = {
  source: "Sim Studio";
  target: "AgentNXXT";
  includeCore: boolean;
  core: {
    product: string;
    capabilities: string[];
    technicalFoundation: string[];
    goToMarket: string[];
  };
};

const banner = [
  "================================",
  "      AgentNXXT Console",
  "================================"
].join("\n");

const helpText = `
Usage:
  bun run packages/agentnxxt-console/src/index.ts [command] [options]

Commands:
  scaffold saas                Create a SaaS blueprint for AgentNXXT
  fork sim-studio --add-core   Build a Sim Studio fork plan and include core
  help                         Show this help

Options for 'scaffold saas':
  --product <name>             Product name (default: "Sim Studio SaaS")
  --builder <name>             Builder type (NoCodeAgentBuilder|Custom)

Options for 'fork sim-studio':
  --product <name>             Product name in the fork plan (default: "Sim Studio Core")
  --add-core                   Include core capabilities in the output plan
`;

function readOption(args: string[], optionName: string): string | undefined {
  const index = args.indexOf(optionName);
  if (index === -1) return undefined;
  return args[index + 1];
}

function hasFlag(args: string[], flagName: string): boolean {
  return args.includes(flagName);
}

function createSaaSBlueprint(productName: string, builder: BuilderType): SaaSBlueprint {
  return {
    productName,
    platform: "AgentNXXT",
    builder,
    coreModules: [
      "No-code workflow canvas",
      "Agent templates marketplace",
      "Integrations hub (LLMs, CRMs, DBs)",
      "Team collaboration + role-based access",
      "Observability dashboard (runs, latency, costs)",
      "API + webhook publishing"
    ],
    monetization: [
      "Free tier (limited runs)",
      "Pro subscription (higher limits + premium templates)",
      "Usage-based overages (compute/model calls)",
      "Enterprise plan (SSO, audit logs, SLA)"
    ],
    launchChecklist: [
      "Define ICP and 3 top automation use-cases",
      "Publish 10 starter templates in NoCodeAgentBuilder",
      "Set pricing + limits in billing provider",
      "Set up analytics funnel and activation metrics",
      "Create onboarding flow with 5-minute quickstart",
      "Configure support channel and status page"
    ]
  };
}

function createSimStudioForkPlan(productName: string, includeCore: boolean): ForkPlan {
  return {
    source: "Sim Studio",
    target: "AgentNXXT",
    includeCore,
    core: {
      product: productName,
      capabilities: [
        "Visual no-code agent builder",
        "Template library with reusable workflows",
        "Model + tool integrations",
        "Execution logs and debugging",
        "Multi-tenant workspace management"
      ],
      technicalFoundation: [
        "Next.js + Bun monorepo",
        "PostgreSQL with pgvector",
        "Auth + RBAC",
        "Realtime execution and background jobs",
        "API + webhooks for third-party apps"
      ],
      goToMarket: [
        "Target SMB operations teams",
        "Offer free plan plus usage upgrades",
        "Ship 5 high-value vertical templates",
        "Track activation, retention, and expansion KPIs"
      ]
    }
  };
}

function runScaffoldSaaS(args: string[]) {
  const product = readOption(args, "--product") ?? "Sim Studio SaaS";
  const rawBuilder = readOption(args, "--builder") ?? "NoCodeAgentBuilder";

  const builder: BuilderType = rawBuilder === "Custom" ? "Custom" : "NoCodeAgentBuilder";
  const blueprint = createSaaSBlueprint(product, builder);

  console.log(banner);
  console.log("SaaS blueprint created successfully.\n");
  console.log(JSON.stringify(blueprint, null, 2));
}

function runForkSimStudio(args: string[]) {
  const product = readOption(args, "--product") ?? "Sim Studio Core";
  const includeCore = hasFlag(args, "--add-core");

  const plan = createSimStudioForkPlan(product, includeCore);

  console.log(banner);
  if (!includeCore) {
    console.log("Tip: use --add-core to explicitly include core capabilities in this fork plan.\n");
  } else {
    console.log("Sim Studio fork plan created with core included.\n");
  }

  console.log(JSON.stringify(plan, null, 2));
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    console.log(banner);
    console.log(helpText);
    return;
  }

  if (args[0] === "scaffold" && args[1] === "saas") {
    runScaffoldSaaS(args.slice(2));
    return;
  }

  if (args[0] === "fork" && args[1] === "sim-studio") {
    runForkSimStudio(args.slice(2));
    return;
  }

  console.log(banner);
  console.log(`Unknown command: ${args.join(" ")}`);
  console.log(helpText);
}

main();
