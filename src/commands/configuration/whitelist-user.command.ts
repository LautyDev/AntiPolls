import {
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../classes/Command';
import whitelistUser from '../../models/whitelistUser';
import { Bars, Colors } from '../../constants';

export default new Command({
	id: 'whitelist-user',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('whitelist-user')
			.setDescription('Whitelist of users.')
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addSubcommand((option) =>
				option
					.setName('add')
					.setDescription('Add a user to the whitelist.')
					.addUserOption((option) =>
						option
							.setName('user')
							.setDescription('User to add to whitelist.')
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('remove')
					.setDescription('Remove a user to the whitelist.')
					.addUserOption((option) =>
						option
							.setName('user')
							.setDescription('User to remove to whitelist.')
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('view')
					.setDescription('View the user whitelist.')
			),
	}),
	run: async ({ interaction, reply }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		if (!interaction.inCachedGuild()) return;

		if (interaction.options.getSubcommand() === 'add') {
			const user = interaction.options.getMember('user');

			const data = await whitelistUser.findOne({
				user: user?.id,
				guild: interaction.guildId,
			});

			if (data)
				return interaction.editReply(
					reply.error(`${user} is already on the whitelist.`)
				);

			try {
				await new whitelistUser({
					user: user?.id,
					guild: interaction.guildId,
				}).save();

				await interaction.editReply(
					reply.success(
						`${user} was added to the whitelist correctly.`
					)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to add ${user} to the whitelist.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'remove') {
			const user = interaction.options.getMember('user');

			const data = await whitelistUser.findOne({
				user: user?.id,
				guild: interaction.guildId,
			});

			if (!data)
				return interaction.editReply(
					reply.error(`${user} is not on the whitelist.`)
				);

			try {
				await whitelistUser.findOneAndDelete({
					user: user?.id,
					guild: interaction.guildId,
				});

				await interaction.editReply(
					reply.success(
						`${user} was removed to the whitelist correctly.`
					)
				);
			} catch {
				interaction.editReply(
					reply.success(
						`An error occurred while trying to remove ${user} to the whitelist.`
					)
				);
			}
		} else if (interaction.options.getSubcommand() === 'view') {
			const data = (
				await whitelistUser.find({
					guild: interaction.guildId,
				})
			).map((u) => `<@${u.user}>`);

			const embed = new EmbedBuilder()
				.setTitle(`Whitelist of ${interaction.guild.name} users`)
				.setDescription(data.join('\n') || 'No users on the whitelist.')
				.setImage(Bars.Grey)
				.setColor(Colors.Main);

			interaction.editReply({
				embeds: [embed],
			});
		}

		return;
	},
});
