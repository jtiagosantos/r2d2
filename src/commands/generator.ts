import { GluegunToolbox } from 'gluegun';
import { Command } from 'gluegun/build/types/domain/command';
import { PromptOptions } from 'gluegun/build/types/toolbox/prompt-enquirer-types';
import { z, ZodError } from 'zod';
import { copy } from 'copy-paste';
import { createId } from '@paralleldrive/cuid2';
import { v1 as uuidv1, v4 as uuidv4, v6 as uuidv6, v7 as uuidv7 } from 'uuid';
import { nanoid } from 'nanoid';
import { ulid } from 'ulid';

const parametersSchema = z.object({
  first: z
    .enum(['cuid', 'nanoid', 'ulid', 'uuidv1', 'uuidv4', 'uuidv6', 'uuidv7'], {
      message:
        '🤖 generator (g) command needs a param: [cuid, nanoid, ulid, uuidv1, uuidv4, uuidv6, uuidv7]',
    })
    .nullable()
    .default(null),
});

module.exports = {
  name: 'generator',
  description: 'generate unique and random identifiers',
  alias: ['g'],
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, prompt } = toolbox;

    try {
      let { first: param } = parametersSchema.parse(parameters);

      if (!param) {
        const askIdentifier = {
          type: 'select',
          name: 'identifier',
          message: '🤖 What type of identifier do you want?',
          choices: ['cuid', 'nanoid', 'ulid', 'uuidv1', 'uuidv4', 'uuidv6', 'uuidv7'],
        } as PromptOptions;

        const { identifier } = await prompt.ask(askIdentifier);

        param = identifier as any;
      }

      const generator = {
        cuid: createId,
        nanoid,
        ulid,
        uuidv1,
        uuidv4,
        uuidv6,
        uuidv7,
      }[param];

      let output = generator();

      const spinner = toolbox.print.spin('🤖 generating...');

      await toolbox.system.run('sleep 1');

      spinner.stop();

      copy(output);

      spinner.succeed(output);

      print.newline();

      print.info('🤖 copied to your clipboard');

      process.exit(1);
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach((error) => {
          print.error(error.message);
        });
      } else {
        print.error('🤖 unexpected error, try again');
      }
    }
  },
} as Command;
