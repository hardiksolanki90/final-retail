/**
 * My Plugin - Custom Claude Plugin for Retail App React
 *
 * Extend this plugin to add custom behaviors, hooks,
 * or integrations specific to the React frontend workflow.
 */

module.exports = {
  name: 'my-plugin',
  version: '1.0.0',

  activate(context) {
    console.log('[my-plugin] Activated for Retail App React');
  },

  deactivate() {
    console.log('[my-plugin] Deactivated');
  },

  hooks: {
    onFileChange(filePath) {
      // React to file changes (e.g., auto-lint .tsx files)
    },
    onCommand(command) {
      // Intercept or augment commands
    },
  },
};
