// Practical companion to the manifesto, checked against the framework README.
// Keep setup details upstream so plugin versions and installation steps cannot drift.
export const FRAMEWORK = {
  name: 'AI-Driven Dev Framework',
  url: 'https://github.com/ai-driven-dev/framework',
  title: 'Start with the AIDD framework',
  description:
    'The AI-Driven Dev Framework brings reusable skills, agents, commands, and rules into your AI coding tool. It provides a shared workflow for planning, implementation, validation, and review.',
  compatibility:
    'Available for Claude Code, Cursor, GitHub Copilot, Codex, OpenCode, and Kilo Code. Installation differs by tool; use the official guide for yours.',
  safety:
    'Review the plugins and their permissions before installing. Some plugins run hooks automatically and require Node.js 22 or later.',
  steps: [
    {
      title: 'Install for your coding tool',
      description:
        'Follow the official setup guide to add the stable plugins. The framework is open source, and works inside the coding tool you already use.',
      link: { label: 'Installation guide', url: 'https://github.com/ai-driven-dev/framework#-install' },
    },
    {
      title: 'Orient the framework in your project',
      description:
        'Open your project and start guided onboarding. It inspects the repository and helps you choose the next step, including setting up durable project context.',
      command: '/aidd-context:00-onboard',
      link: { label: 'Quick-start guide', url: 'https://github.com/ai-driven-dev/framework#-quick-start' },
    },
    {
      title: 'Try one bounded change',
      description:
        'Give the feature workflow a concrete request. Inspect the plan, tests, and review findings before deciding whether to merge the resulting pull request.',
      command: '/aidd-orchestrator:01-sdlc "add rate limiting to the /login endpoint"',
      link: { label: 'Feature workflow', url: 'https://github.com/ai-driven-dev/framework/tree/main/plugins/aidd-orchestrator/skills/01-sdlc' },
    },
  ],
};
