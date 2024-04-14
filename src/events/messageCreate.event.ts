import { EmbedBuilder, Events, TextChannel } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';
import whitelistUser from '../models/whitelistUser';
import whitelistRole from '../models/whitelistRole';
import logs from '../models/logs';
import { Bars, Colors } from '../constants';

const userPollCount = new Map();

export default new ClientEvent({
	name: Events.MessageCreate,
	once: false,
	run: async ({ client }, message) => {
		if (message.channel.isDMBased() || message.author.bot) return;

		const inWhitelistUser = await whitelistUser.findOne({
			user: message.author.id,
			guild: message.guild!.id,
		});

		const whitelistRoles = await whitelistRole.find({
			guild: message.guild!.id,
		});

		const logsData = await logs.findOne({
			guild: message.guild!.id,
		});

		if (client.util.isPoll(message)) {
			if (
				message.member?.permissions.has('ManageGuild') ||
				inWhitelistUser ||
				whitelistRoles.some((r) =>
					message.member?.roles.cache.has(r.role)
				)
			)
				return;

			await message
				.reply(`Polls are not allowed on this guild.`)
				.then((m) =>
					setTimeout(() => m.delete().catch(() => null), 2500)
				)
				.catch(() => null);

			message.delete().catch(() => null);

			let pollCount = userPollCount.get(message.author.id) || 0;
			pollCount++;

			userPollCount.set(message.author.id, pollCount);

			await sendLogs(1);

			switch (pollCount) {
				case 3:
					message.member
						?.timeout(
							10 * 60 * 1000,
							'Abuse of polls on 3 occasions.'
						)
						.then(
							async () =>
								await sendLogs(
									2,
									'Abuse of polls on 3 occasions.',
									10
								)
						)
						.catch(() => null);
					break;
				case 6:
					message.member
						?.timeout(
							25 * 60 * 1000,
							'Abuse of polls on 6 occasions.'
						)
						.then(
							async () =>
								await sendLogs(
									2,
									'Abuse of polls on 6 occasions.',
									25
								)
						)
						.catch(() => null);

					break;
				case 9:
					message.member
						?.ban({
							reason: 'Abuse of polls on multiple occasions.',
						})
						.then(
							async () =>
								await sendLogs(
									3,
									'Abuse of polls on multiple occasions.'
								)
						)
						.catch(() => null);
					break;
			}

			setTimeout(
				() => userPollCount.delete(message.author.id),
				40 * 60 * 1000
			);
		}

		async function sendLogs(type: number, reason?: string, time?: number) {
			if (!logsData) return;

			const formatEmbed = (): any => {
				switch (type) {
					case 1:
						return new EmbedBuilder()
							.setTitle('Poll deleted')
							.setDescription(
								`I deleted a poll on ${message.channel}.`
							)
							.setThumbnail(message.author?.avatarURL() as string)
							.addFields([
								{
									name: 'User',
									value: `${message.author}`,
								},
							])
							.setImage(Bars.Grey)
							.setColor(Colors.Main);

					case 2:
						return new EmbedBuilder()
							.setTitle('User muted')
							.setDescription(
								'I have muted a user for abusing the polls.'
							)
							.setThumbnail(message.author?.avatarURL() as string)
							.addFields([
								{
									name: 'User',
									value: `${message.author}`,
								},
								{
									name: 'Reason',
									value: reason ?? '',
								},
								{
									name: 'Time',
									value: `${time} minutes.`,
								},
							])
							.setImage(Bars.Yellow)
							.setColor(Colors.Main);

					case 3:
						return new EmbedBuilder()
							.setTitle('User banned')
							.setDescription(
								'I have banned a user for abusing polls on many occasions.'
							)
							.setThumbnail(message.author?.avatarURL() as string)
							.addFields([
								{
									name: 'User',
									value: `${message.author}`,
								},
								{
									name: 'Reason',
									value: reason ?? '',
								},
							])
							.setImage(Bars.Red)
							.setColor(Colors.Main);
				}
			};

			const logsChannel = message.guild?.channels.cache.get(
				logsData?.channel as string
			) as TextChannel;

			logsChannel
				.send({
					embeds: [formatEmbed()],
				})
				.catch(() => null);
		}

		return;
	},
});
