import {
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';
import { Command } from '../../classes/Command';
import logs from '../../models/logs';
import { Bars, Colors } from '../../constants';

export default new Command({
	id: 'logs',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('logs')
			.setDescription('Automod logs.')
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addSubcommand((option) =>
				option
					.setName('set')
					.setDescription('Set the logs channel.')
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('Logs channel.')
							.addChannelTypes(ChannelType.GuildText)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('remove')
					.setDescription('Remove the logs channel.')
			)
			.addSubcommand((option) =>
				option.setName('view').setDescription('View the logs channel.')
			),
	}),
	run: async ({ client, interaction, reply }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		if (!interaction.inCachedGuild()) return;

		switch (interaction.options.getSubcommand()) {
			case 'set':
				{
					const channel = (interaction.options.getChannel(
						'channel'
					) || interaction.channel) as TextChannel;

					if (
						!interaction.guild.members.me?.permissions.has(
							'ManageWebhooks'
						)
					)
						return interaction.editReply(
							reply.error(
								`I don't have permissions to manage webhooks in ${channel}.`
							)
						);

					try {
						const webhookLogs = await channel.createWebhook({
							name: 'AntiPolls Logs',
							avatar: client.user?.avatarURL(),
						});

						await new logs({
							channel: channel?.id,
							webhook_id: webhookLogs.id,
							webhook_url: webhookLogs.url,
							guild: interaction.guildId,
						}).save();

						interaction.editReply(
							reply.success(`${channel} was correctly seated.`)
						);
					} catch {
						interaction.editReply(
							reply.error(
								`An error occurred while trying to set ${channel} as logs channel.`
							)
						);
					}
				}
				break;

			case 'remove':
				{
					const data = await logs.findOne({
						guild: interaction.guildId,
					});

					if (!data)
						return interaction.editReply(
							reply.error(`No channel set as logs.`)
						);

					try {
						const channel = interaction.guild?.channels.cache.get(
							data?.channel as string
						) as TextChannel;

						(await channel.fetchWebhooks())
							.find((w) => w.id === data.webhook_id)
							?.delete()
							.catch(() => null);

						await logs.findOneAndDelete({
							guild: interaction.guildId,
						});

						interaction.editReply(
							reply.success(
								`<#${data.channel}>  was removed correctly.`
							)
						);
					} catch {
						interaction.editReply(
							reply.error(
								`An error occurred while trying to remove <#${data.channel}> as logs channel.`
							)
						);
					}
				}
				break;

			case 'view':
				{
					const data = await logs.findOne({
						guild: interaction.guildId,
					});

					const embed = new EmbedBuilder()
						.setTitle(`Logs channel of ${interaction.guild.name}`)
						.setDescription(
							data
								? `<#${data?.channel}>`
								: 'No channel set as logs.'
						)
						.setImage(Bars.Grey)
						.setColor(Colors.Main);

					interaction.editReply({
						embeds: [embed],
					});
				}
				break;
		}

		return;
	},
});
