import { Events } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';
import whitelistUser from '../models/whitelistUser';
import whitelistRole from '../models/whitelistRole';
import whitelistChannel from '../models/whitelistChannel';
import punishments from '../models/punishments';

const userPollCount = new Map();

export default new ClientEvent({
	name: Events.MessageCreate,
	once: false,
	run: async ({ client }, message) => {
		if (message.channel.isDMBased() || message.author.bot) return;

		const inWhitelistUser = await whitelistUser.findOne({
			user: message.author.id,
			guild: message.guild?.id,
		});

		const whitelistRoles = await whitelistRole.find({
			guild: message.guild?.id,
		});

		const whitelistChannels = await whitelistChannel.find({
			guild: message.guild?.id,
		});

		if (client.util.isPoll(message)) {
			if (
				message.member?.permissions.has('ManageGuild') ||
				inWhitelistUser ||
				whitelistRoles.some((r) =>
					message.member?.roles.cache.has(r.role)
				) ||
				whitelistChannels.some((c) => message.channelId === c.channel)
			)
				return;

			await message
				.reply(`Polls are not allowed on this guild.`)
				.then((m) =>
					setTimeout(() => m.delete().catch(() => null), 2500)
				)
				.catch(() => null);

			try {
				message.delete();

				await client.util.sendLogs({
					type: 'delete-poll',
					guild: message.guildId,
					author: message.author,
					authorAvatar: message.author.avatarURL(),
					channel: message.channel,
				});
			} catch {
				null;
			}

			let pollCount =
				userPollCount.get(`${message.guildId}-${message.author.id}`) ||
				0;
			pollCount++;

			userPollCount.set(
				`${message.guildId}-${message.author.id}`,
				pollCount
			);

			const isPunishment = await punishments.findOne({
				max_polls: pollCount,
				guild: message.guild?.id,
			});

			if (isPunishment)
				switch (isPunishment.type) {
					case 'mute':
						{
							try {
								message.member?.timeout(
									isPunishment.time,
									`${client.user?.displayName} - Punishment #${isPunishment.id}`
								);

								await client.util.sendLogs({
									type: 'mute',
									guild: message.guildId,
									author: message.author,
									authorAvatar: message.author.avatarURL(),
									channel: message.channel,
									punishment: isPunishment.id,
									time: client.util.parseMsToTime(
										isPunishment.time
									),
								});
							} catch {
								null;
							}
						}
						break;

					case 'kick':
						{
							try {
								message.member?.kick(
									`${client.user?.displayName} - Punishment #${isPunishment.id}`
								);

								await client.util.sendLogs({
									type: 'kick',
									guild: message.guildId,
									author: message.author,
									authorAvatar: message.author.avatarURL(),
									channel: message.channel,
									punishment: isPunishment.id,
								});
							} catch {
								null;
							}
						}
						break;

					case 'ban':
						{
							try {
								message.member?.ban({
									reason: `${client.user?.displayName} - Punishment #${isPunishment.id}`,
								});

								await client.util.sendLogs({
									type: 'ban',
									guild: message.guildId,
									author: message.author,
									authorAvatar: message.author.avatarURL(),
									channel: message.channel,
									punishment: isPunishment.id,
								});
							} catch {
								null;
							}
						}
						break;
				}

			const mutePunishments = await punishments.find({
				guild: message.guild?.id,
				type: 'mute',
			});

			const totalMuteTime = mutePunishments
				? mutePunishments
						.map((p) => p.time)
						.reduce((total, time) => total + time, 0)
				: 0;

			setTimeout(
				() =>
					userPollCount.delete(
						`${message.guildId}-${message.author.id}`
					),
				totalMuteTime + 5 * 60 * 1000
			);
		}

		return;
	},
});
