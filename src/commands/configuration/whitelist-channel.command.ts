import {
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../classes/Command';
import whitelistChannel from '../../models/whitelistChannel';
import { Bars, Colors } from '../../constants';

export default new Command({
	id: 'whitelist-channel',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('whitelist-channel')
			.setDescription('Whitelist of channels.')
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addSubcommand((option) =>
				option
					.setName('add')
					.setDescription('Add a channel to the whitelist.')
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('Channel to add to whitelist.')
							.addChannelTypes(ChannelType.GuildText)
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('remove')
					.setDescription('Remove a channel to the whitelist.')
					.addChannelOption((option) =>
						option
							.setName('channel')
							.setDescription('Channel to remove to whitelist.')
							.addChannelTypes(ChannelType.GuildText)
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('view')
					.setDescription('View the channel whitelist.')
			),
	}),
	run: async ({ interaction, reply }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		if (!interaction.inCachedGuild()) return;

		if (interaction.options.getSubcommand() === 'add') {
			const channel = interaction.options.getChannel('channel');

			const data = await whitelistChannel.findOne({
				channel: channel?.id,
				guild: interaction.guildId,
			});

			if (data)
				return interaction.editReply(
					reply.error(`${channel} is already on the whitelist.`)
				);

			try {
				await new whitelistChannel({
					channel: channel?.id,
					guild: interaction.guildId,
				}).save();

				await interaction.editReply(
					reply.success(
						`${channel} was added to the whitelist correctly.`
					)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to add ${channel} to the whitelist.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			const channel = interaction.options.getChannel('channel');

			const data = await whitelistChannel.findOne({
				channel: channel?.id,
				guild: interaction.guildId,
			});

			if (!data)
				return interaction.editReply(
					reply.error(`${channel} is not on the whitelist.`)
				);

			try {
				await whitelistChannel.findOneAndDelete({
					channel: channel?.id,
					guild: interaction.guildId,
				});

				await interaction.editReply(
					reply.success(
						`${channel} was removed to the whitelist correctly.`
					)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to remove ${channel} to the whitelist.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'view') {
			const data = (
				await whitelistChannel.find({
					guild: interaction.guildId,
				})
			).map((c) => `<#${c.channel}>`);

			const embed = new EmbedBuilder()
				.setTitle(`Whitelist of ${interaction.guild.name} channels`)
				.setDescription(
					data.join('\n') || 'No channels on the whitelist.'
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
