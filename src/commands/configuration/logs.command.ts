import {
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
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
	run: async ({ interaction, reply }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		if (!interaction.inCachedGuild()) return;

		if (interaction.options.getSubcommand() === 'set') {
			const channel = interaction.options.getChannel('channel');

			try {
				await new logs({
					channel: channel?.id,
					guild: interaction.guildId,
				}).save();

				await interaction.editReply(
					reply.success(`${channel} was correctly seated.`)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to set ${channel} as logs channel.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			const data = await logs.findOne({
				guild: interaction.guildId,
			});

			if (!data)
				return interaction.editReply(
					reply.error(`No channel set as logs.`)
				);

			try {
				await logs.findOneAndDelete({
					guild: interaction.guildId,
				});

				await interaction.editReply(
					reply.success(`<#${data.channel}>  was removed correctly.`)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to remove <#${data.channel}> as logs channel.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'view') {
			const data = await logs.findOne({
				guild: interaction.guildId,
			});

			const embed = new EmbedBuilder()
				.setTitle(`Logs channel of ${interaction.guild.name}`)
				.setDescription(
					`<#${data?.channel}>` || 'No channel set as logs.'
				)
				.setImage(Bars.Grey)
				.setColor(Colors.Main);

			interaction.editReply({
				embeds: [embed],
			});
		}

		return;
	},
});
