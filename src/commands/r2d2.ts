import { GluegunCommand } from 'gluegun';

const command: GluegunCommand = {
  name: 'r2d2',
  run: async (toolbox) => {
    const { print } = toolbox;
    const { printCommands } = toolbox.print;

    print.warning('✨ Welcome to R2D2 CLI ✨');

    print.newline();

    print.info('🤖 How can I help you?');

    printCommands(toolbox, ['generator']);
  },
};

module.exports = command;
