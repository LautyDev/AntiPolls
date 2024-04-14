import {
	ChannelType,
	EmbedBuilder,
	Events,
	TextChannel,
	WebhookClient,
} from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';
import { Bars, Colors } from '../constants';

export default new ClientEvent({
	name: Events.GuildCreate,
	once: false,
	run: async ({ client }, guild) => {
		// New guild
		const logsWebhook = new WebhookClient({
			url: process.env['LOGS_WEBHOOK'] as string,
		});

		const logsEmbed = new EmbedBuilder()
			.setTitle('New guild')
			.setDescription("I'm on a new guild.")
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
			.setImage(Bars.Green)
			.setColor(Colors.Main);

		await logsWebhook
			.send({
				embeds: [logsEmbed],
			})
			.catch(() => null);

		// Warning
		let warningChannel = (await guild.channels.cache.find(
			(channel) =>
				channel.name === 'general' &&
				channel.type === ChannelType.GuildText
		)) as TextChannel | undefined;

		if (
			warningChannel &&
			!warningChannel.permissionsFor(client.user!)?.has('SendMessages')
		)
			warningChannel = undefined;

		if (!warningChannel)
			warningChannel = (await guild.channels.cache.find(
				(channel) =>
					channel.type === ChannelType.GuildText &&
					channel.permissionsFor(client.user!)?.has('SendMessages')
			)) as TextChannel;

		const warningEmbed = new EmbedBuilder()
			.setTitle('Warning')
			.setDescription(
				'For my good performance I need to have a high role in this guild.'
			)
			.setImage(Bars.Yellow)
			.setColor(Colors.Main);

		await warningChannel
			.send({
				content: `${await guild.fetchOwner()}`,
				embeds: [warningEmbed],
			})
			.catch(() => null);
	},
});
