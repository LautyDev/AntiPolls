import {
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../classes/Command';
import whitelistRole from '../../models/whitelistRole';
import { Bars, Colors } from '../../constants';

export default new Command({
	id: 'whitelist-role',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('whitelist-role')
			.setDescription('Whitelist of roles.')
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addSubcommand((option) =>
				option
					.setName('add')
					.setDescription('Add a role to the whitelist.')
					.addRoleOption((option) =>
						option
							.setName('role')
							.setDescription('Role to add to whitelist.')
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('remove')
					.setDescription('Remove a role to the whitelist.')
					.addRoleOption((option) =>
						option
							.setName('role')
							.setDescription('Role to remove to whitelist.')
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('view')
					.setDescription('View the role whitelist.')
			),
	}),
	run: async ({ interaction, reply }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		if (!interaction.inCachedGuild()) return;

		if (interaction.options.getSubcommand() === 'add') {
			const role = interaction.options.getRole('role');

			const data = await whitelistRole.findOne({
				role: role?.id,
				guild: interaction.guildId,
			});

			if (data)
				return interaction.editReply(
					reply.error(`${role} is already on the whitelist.`)
				);

			try {
				await new whitelistRole({
					role: role?.id,
					guild: interaction.guildId,
				}).save();

				await interaction.editReply(
					reply.success(
						`${role} was added to the whitelist correctly.`
					)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to add ${role} to the whitelist.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			const role = interaction.options.getRole('role');

			const data = await whitelistRole.findOne({
				role: role?.id,
				guild: interaction.guildId,
			});

			if (!data)
				return interaction.editReply(
					reply.error(`${role} is not on the whitelist.`)
				);

			try {
				await whitelistRole.findOneAndDelete({
					role: role?.id,
					guild: interaction.guildId,
				});

				await interaction.editReply(
					reply.success(
						`${role} was removed to the whitelist correctly.`
					)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to remove ${role} to the whitelist.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'view') {
			const data = (
				await whitelistRole.find({
					guild: interaction.guildId,
				})
			).map((r) => `<@&${r.role}>`);

			const embed = new EmbedBuilder()
				.setTitle(`Whitelist of ${interaction.guild.name} roles`)
				.setDescription(data.join('\n') || 'No roles on the whitelist.')
				.setImage(Bars.Grey)
				.setColor(Colors.Main);

			interaction.editReply({
				embeds: [embed],
			});
		}

		return;
	},
});
