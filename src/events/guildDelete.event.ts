import { EmbedBuilder, Events, WebhookClient } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';
import { Bars, Colors } from '../constants';
import whitelistUser from '../models/whitelistUser';
import whitelistRole from '../models/whitelistRole';
import whitelistChannel from '../models/whitelistChannel';
import punishments from '../models/punishments';
import logs from '../models/logs';

export default new ClientEvent({
	name: Events.GuildDelete,
	once: false,
	run: async ({ client }, guild) => {
		const logsWebhook = new WebhookClient({
			url: process.env['LOGS_WEBHOOK'] as string,
		});

		await whitelistUser.deleteMany({ guild: guild.id }).catch(() => null);
		await whitelistRole.deleteMany({ guild: guild.id }).catch(() => null);
		await whitelistChannel
			.deleteMany({ guild: guild.id })
			.catch(() => null);
		await punishments.deleteMany({ guild: guild.id }).catch(() => null);
		await logs.findOneAndDelete({ guild: guild.id }).catch(() => null);

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
					value: client.guilds.cache.size.toLocaleString('en-US'),
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
