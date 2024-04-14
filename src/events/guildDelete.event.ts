import { EmbedBuilder, Events, WebhookClient } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';
import { Bars, Colors } from '../constants';

export default new ClientEvent({
	name: Events.GuildDelete,
	once: false,
	run: async ({ client }, guild) => {
		const logsWebhook = new WebhookClient({
			url: process.env['LOGS_WEBHOOK'] as string,
		});

		const logsEmbed = new EmbedBuilder()
			.setTitle('Remove from a guild')
			.setDescription('I was removed from a guild.')
			.setThumbnail(guild.iconURL())
			.addFields([
				{
					name: 'Name',
					value: guild.name,
				},
				{
					name: 'Guilds',
					value: client.guilds.cache.size.toString(),
				},
			])
			.setImage(Bars.Red)
			.setColor(Colors.Main);

		await logsWebhook
			.send({
				embeds: [logsEmbed],
			})
			.catch(() => null);
	},
});
