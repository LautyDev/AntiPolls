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
					name: 'Members',
					value: (await guild.fetch()).memberCount.toLocaleString(
						'en-US'
					),
				},
				{
					name: 'Guilds',
					value: client.guilds.cache.size.toLocaleString('en-US'),
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
		let warningChannel = guild.channels.cache.find(
			(c) =>
				(c.name.includes('general') ||
					c.name.includes('chat') ||
					c.name.includes('main')) &&
				c.type === ChannelType.GuildText
		) as TextChannel | undefined;

		if (
			warningChannel &&
			!warningChannel.permissionsFor(client.user!)?.has('SendMessages')
		)
			warningChannel = undefined;

		if (!warningChannel)
			guild.channels.cache
				.filter((c) => c.type === ChannelType.GuildText)
				.forEach((c) => {
					if (
						!warningChannel &&
						c.permissionsFor(client.user!)?.has('SendMessages')
					)
						return (warningChannel = c as TextChannel);

					return;
				});

		const warningEmbed = new EmbedBuilder()
			.setTitle('Warning')
			.setDescription(
				'For my good performance I need to have a high role in this guild. Check my commands to get started.'
			)
			.setImage(Bars.Yellow)
			.setColor(Colors.Main);

		await warningChannel
			?.send({
				content: `${await guild.fetchOwner()}`,
				embeds: [warningEmbed],
			})
			.catch(() => null);
	},
});
