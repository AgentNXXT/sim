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

const banner = [
  "================================",
  "      AgentNXXT Console",
  "================================"
].join("\n");

const helpText = `
Usage:
  bun run packages/agentnxxt-console/src/index.ts [command] [options]

Commands:
  scaffold saas       Create a SaaS blueprint for AgentNXXT
  help                Show this help

Options for 'scaffold saas':
  --product <name>    Product name (default: "Sim Studio SaaS")
  --builder <name>    Builder type (NoCodeAgentBuilder|Custom)
`;

function readOption(args: string[], optionName: string): string | undefined {
  const index = args.indexOf(optionName);
  if (index === -1) return undefined;
  return args[index + 1];
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

function runScaffoldSaaS(args: string[]) {
  const product = readOption(args, "--product") ?? "Sim Studio SaaS";
  const rawBuilder = readOption(args, "--builder") ?? "NoCodeAgentBuilder";

  const builder: BuilderType = rawBuilder === "Custom" ? "Custom" : "NoCodeAgentBuilder";
  const blueprint = createSaaSBlueprint(product, builder);

  console.log(banner);
  console.log("SaaS blueprint created successfully.\n");
  console.log(JSON.stringify(blueprint, null, 2));
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

  console.log(banner);
  console.log(`Unknown command: ${args.join(" ")}`);
  console.log(helpText);
}

main();
