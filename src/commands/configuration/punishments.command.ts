import {
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../classes/Command';
import punishments from '../../models/punishments';
import { Bars, Colors } from '../../constants';

export default new Command({
	id: 'punishments',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('punishments')
			.setDescription('Configuration of punishments.')
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			.addSubcommand((option) =>
				option
					.setName('add')
					.setDescription('Add a punishment.')
					.addStringOption((option) =>
						option
							.setName('type')
							.setDescription('Type of punishment.')
							.addChoices(
								{
									name: 'mute',
									value: 'mute',
								},
								{
									name: 'kick',
									value: 'kick',
								},
								{
									name: 'ban',
									value: 'ban',
								}
							)
							.setRequired(true)
					)
					.addNumberOption((option) =>
						option
							.setName('max_polls')
							.setDescription(
								'Maximum number of polls before action.'
							)
							.setMinValue(1)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName('time')
							.setDescription(
								'COMPLETE IF THE PUNISHMENT IS MUTE: Duration.'
							)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('edit')
					.setDescription('Edit a punishment.')
					.addNumberOption((option) =>
						option
							.setName('id')
							.setDescription('ID of the punishment to edit.')
							.setMinValue(1)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName('type')
							.setDescription('Type of punishment.')
							.addChoices(
								{
									name: 'mute',
									value: 'mute',
								},
								{
									name: 'kick',
									value: 'kick',
								},
								{
									name: 'ban',
									value: 'ban',
								}
							)
							.setRequired(true)
					)
					.addNumberOption((option) =>
						option
							.setName('max_polls')
							.setDescription(
								'Maximum number of polls before action.'
							)
							.setMinValue(1)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName('time')
							.setDescription(
								'COMPLETE IF THE PUNISHMENT IS MUTE: Duration.'
							)
					)
			)
			.addSubcommand((option) =>
				option
					.setName('remove')
					.setDescription('Remove a punishment.')
					.addNumberOption((option) =>
						option
							.setName('id')
							.setDescription('ID of the punishment to remove.')
							.setMinValue(1)
							.setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option.setName('view').setDescription('View punishments.')
			),
	}),
	run: async ({ client, interaction, reply }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		if (!interaction.inCachedGuild()) return;

		switch (interaction.options.getSubcommand()) {
			case 'add':
				{
					const type = interaction.options.getString('type');
					const maxPolls = interaction.options.getNumber('max_polls');
					const time = interaction.options
						.getString('time')
						?.toLowerCase();

					const alreadyExists = await punishments.findOne({
						max_polls: maxPolls,
						guild: interaction.guildId,
					});

					if (alreadyExists)
						return interaction.editReply(
							reply.error(
								`There is already a punishment with that number of polls. Use the command to edit.\n\n**Punishment ID:** ${alreadyExists.id}.`
							)
						);

					switch (type) {
						case 'mute':
							{
								if (
									!interaction.guild.members.me?.permissions.has(
										'ModerateMembers'
									)
								)
									return interaction.editReply(
										reply.error(
											"I don't have permissions to moderate members."
										)
									);

								if (!time)
									return interaction.editReply(
										reply.error(
											'You have to specify the mute time for this type of punishment.'
										)
									);

								if (
									!time?.includes('s') &&
									!time?.includes('m') &&
									!time?.includes('h') &&
									!time?.includes('d')
								)
									return interaction.editReply(
										reply.error(
											'You have to specify the time format.\n\nXs (seconds).\nXm (minutes).\nXh (hours).\nXd (days).\n\nFor example, 10m for 10 minutes.'
										)
									);
							}
							break;

						case 'kick':
							if (
								!interaction.guild.members.me?.permissions.has(
									'KickMembers'
								)
							)
								return interaction.editReply(
									reply.error(
										"I don't have permissions to kick members."
									)
								);
							break;

						case 'ban':
							if (
								!interaction.guild.members.me?.permissions.has(
									'BanMembers'
								)
							)
								return interaction.editReply(
									reply.error(
										"I don't have permissions to ban members."
									)
								);
							break;
					}

					try {
						const latestPunishments = await punishments
							.find({
								guild: interaction.guildId,
							})
							.sort({ id: -1 })
							.limit(1)
							.exec();

						const latestPunishment = latestPunishments
							? latestPunishments[0]
							: null;

						type === 'mute'
							? await new punishments({
									id: latestPunishment
										? latestPunishment.id + 1
										: 1,
									type: type,
									max_polls: maxPolls,
									time: client.util.parseTimeToMs(
										time as string
									),
									guild: interaction.guildId,
									date: Date.now(),
							  }).save()
							: await new punishments({
									id: latestPunishment
										? latestPunishment.id + 1
										: 1,
									type: type,
									max_polls: maxPolls,
									guild: interaction.guildId,
									date: Date.now(),
							  }).save();

						interaction.editReply(
							reply.success('Punishment correctly established.')
						);
					} catch {
						interaction.editReply(
							reply.error(
								'An error occurred when trying to add that punishment.'
							)
						);
					}
				}
				break;

			case 'edit':
				{
					const id = interaction.options.getNumber('id');
					const type = interaction.options.getString('type');
					const maxPolls = interaction.options.getNumber('max_polls');
					const time = interaction.options
						.getString('time')
						?.toLowerCase();

					const itExist = await punishments.findOne({
						id: id,
						guild: interaction.guildId,
					});

					const alreadyExists = await punishments.findOne({
						max_polls: maxPolls,
						guild: interaction.guildId,
					});

					if (!itExist)
						return interaction.editReply(
							reply.error('There is no punishment with this ID.')
						);

					if (alreadyExists && alreadyExists.id !== id)
						return interaction.editReply(
							reply.error(
								`There is already a punishment with that number of polls. Use the command to edit.\n\n**Punishment ID:** ${alreadyExists.id}.`
							)
						);

					switch (type) {
						case 'mute':
							{
								if (
									!interaction.guild.members.me?.permissions.has(
										'ModerateMembers'
									)
								)
									return interaction.editReply(
										reply.error(
											"I don't have permissions to moderate members."
										)
									);

								if (!time)
									return interaction.editReply(
										reply.error(
											'You have to specify the mute time for this type of punishment.'
										)
									);

								if (
									!time?.includes('s') &&
									!time?.includes('m') &&
									!time?.includes('h') &&
									!time?.includes('d')
								)
									return interaction.editReply(
										reply.error(
											'You have to specify the time format.\n\nXs (seconds).\nXm (minutes).\nXh (hours).\nXd (days).\n\nFor example, 10m for 10 minutes.'
										)
									);
							}
							break;

						case 'kick':
							if (
								!interaction.guild.members.me?.permissions.has(
									'KickMembers'
								)
							)
								return interaction.editReply(
									reply.error(
										"I don't have permissions to kick members."
									)
								);
							break;

						case 'ban':
							if (
								!interaction.guild.members.me?.permissions.has(
									'BanMembers'
								)
							)
								return interaction.editReply(
									reply.error(
										"I don't have permissions to ban members."
									)
								);
							break;
					}

					try {
						type === 'mute'
							? await punishments.updateOne(
									{
										id: id,
										guild: interaction.guildId,
									},
									{
										type: type,
										max_polls: maxPolls,
										time: client.util.parseTimeToMs(
											time as string
										),
									}
							  )
							: await punishments.updateOne(
									{
										id: id,
										guild: interaction.guildId,
									},
									{
										type: type,
										max_polls: maxPolls,
									}
							  );

						interaction.editReply(
							reply.success('Punishment correctly edited.')
						);
					} catch {
						interaction.editReply(
							reply.error(
								'An error occurred when trying to edit that punishment.'
							)
						);
					}
				}
				break;

			case 'remove':
				{
					const id = interaction.options.getNumber('id');

					const itExist = await punishments.findOne({
						id: id,
						guild: interaction.guildId,
					});

					if (!itExist)
						return interaction.editReply(
							reply.error('There is no punishment with this ID.')
						);

					try {
						await punishments.findOneAndDelete({
							id: id,
							guild: interaction.guildId,
						});

						interaction.editReply(
							reply.success('Punishment correctly removed.')
						);
					} catch {
						interaction.editReply(
							reply.error(
								'An error occurred when trying to remove that punishment.'
							)
						);
					}
				}
				break;

			case 'view':
				{
					const punishmentsInGuild = await punishments.find({
						guild: interaction.guildId,
					});

					const embed = new EmbedBuilder()
						.setTitle(`${interaction.guild.name} punishments`)
						.setColor(Colors.Main)
						.setImage(Bars.Grey);

					punishmentsInGuild.length > 0
						? punishmentsInGuild.map((p) => {
								p.type === 'mute'
									? embed.addFields([
											{
												name: `Punishment #${p.id}`,
												value: `**Type:** ${
													p.type
												}\n**Maximum polls:** ${
													p.max_polls
												}\n**Time:** ${client.util.parseMsToTime(
													p.time
												)}`,
											},
									  ])
									: embed.addFields([
											{
												name: `Punishment #${p.id}`,
												value: `**Type:** ${p.type}\n**Maximum polls:** ${p.max_polls}`,
											},
									  ]);
						  })
						: embed.setDescription(
								'There are no established punishments.'
						  );

					interaction.editReply({
						embeds: [embed],
					});
				}
				break;
		}

		return;
	},
});
