import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
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
		await interaction.deferReply();

		const embed = new EmbedBuilder()
			.setTitle(Bot.Name)
			.setDescription(`Thank you for inviting ${Bot.Name}`)
			.setImage(Bars.Grey)
			.setColor(Colors.Main);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel(`Invite ${Bot.Name}`)
				.setStyle(ButtonStyle.Link)
				.setURL(Bot.Invite),

			new ButtonBuilder()
				.setLabel(`Support`)
				.setStyle(ButtonStyle.Link)
				.setURL(Bot.Support)
		);

		interaction.editReply({
			embeds: [embed],
			components: [row],
		});

		return;
	},
});
