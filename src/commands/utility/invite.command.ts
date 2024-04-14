import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';
import { Bars, Bot, Colors } from '../../constants';

export default new Command({
	id: 'invite',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('invite')
			.setDescription('Get the bot invitation.'),
	}),
	run: async ({ interaction }) => {
		await interaction.deferReply({
			ephemeral: true,
		});

		const embed = new EmbedBuilder()
			.setTitle(`Invite ${Bot.Name}`)
			.setDescription(`## [Click here.](${Bot.Invite})`)
			.setImage(Bars.Grey)
			.setColor(Colors.Main);

		interaction.editReply({
			embeds: [embed],
		});

		return;
	},
});
