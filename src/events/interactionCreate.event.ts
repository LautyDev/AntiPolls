import { Events, WebhookClient } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';
import { ReplyClient } from '../classes/ReplyClient';

export default new ClientEvent({
	name: Events.InteractionCreate,
	once: false,
	run: async ({ client }, interaction) => {
		if (interaction.isChatInputCommand()) {
			const command = client.managers.commandManager.getCommand(
				(cmd) => cmd.id === interaction.commandName
			);

			if (command)
				await command
					.run({
						client,
						interaction,
						reply: new ReplyClient(),
					})
					.catch(async (error) => {
						console.error(error);

						const logsWebhook = new WebhookClient({
							url: process.env['LOGS_WEBHOOK'] as string,
						});

						const message = `An error ocurred while executing the commands:\n\n${client.util.toCodeBlock(
							'ts',
							error.toString()
						)}`;

						await interaction.followUp({
							content: message,
						});

						await logsWebhook.send({
							content: message,
						});
					});
		}

		return undefined;
	},
});
