import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Plumb — Solana signer-side security',
    description:
      'Decode Squads V4 approvals before you sign. Catches durable-nonce replays, multisig admin actions, and bytecode authority changes.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: [
      'https://app.squads.so/*',
      'https://devnet.squads.so/*',
      'https://*.helius-rpc.com/*',
      'https://api.mainnet-beta.solana.com/*',
      'https://api.devnet.solana.com/*',
    ],
    action: {
      default_title: 'Plumb',
      default_popup: 'popup.html',
    },
    web_accessible_resources: [
      {
        resources: ['injected.js'],
        matches: ['https://app.squads.so/*', 'https://devnet.squads.so/*'],
      },
    ],
  },
});
