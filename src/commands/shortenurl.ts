import { GluegunToolbox } from 'gluegun';
import { Command } from 'gluegun/build/types/domain/command';
import { z, ZodError } from 'zod';
import { copy } from 'copy-paste';

const parametersSchema = z.object({
  first: z
    .string()
    .nullable()
    .default(null),
});

module.exports = {
  name: 'shortenurl',
  description: 'shorten a url',
  alias: ['su'],
  run: async (toolbox: GluegunToolbox) => {
    const { parameters, print, prompt, http } = toolbox;

    try {
      let { first: param } = parametersSchema.parse(parameters);

      if (!param) {
        const askUrl = {
          type: 'input',
          name: 'url',
          message: '🤖 What url do you want to shorten?',
        };

        const { url } = await prompt.ask(askUrl);

        param = url;
      }

      const spinner = toolbox.print.spin('🤖 shortening...');

      spinner.start();

      const api = http.create({
        baseURL: 'https://api.encurtador.dev/encurtamentos',
      });

      const { ok, data } = await api.post('/', {
        url: param,
      });

      spinner.stop();

      if (!ok) {
        print.error('🤖 failed to shorten url');
        return;
      }

      spinner.stop();

      const shortUrl = (data as any).urlEncurtada;

      copy(shortUrl);

      spinner.succeed(shortUrl);

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
