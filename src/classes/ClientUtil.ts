import { EmbedBuilder, Message, WebhookClient } from 'discord.js';
import logs from '../models/logs';
import { Bars, Colors } from '../constants';

export class ClientUtil {
	toCodeBlock(code: string, text: string): string {
		return `\`\`\`${code.replace(/```/g, '')}\n${text.replace(
			/```/g,
			''
		)}\n\`\`\``;
	}

	isPoll(message: Message): boolean {
		return (
			message.activity === null &&
			message.cleanContent === '' &&
			message.roleSubscriptionData === null &&
			message.components.length === 0 &&
			message.system === false &&
			message.webhookId === null &&
			message.type === 0 &&
			message.attachments.size === 0 &&
			message.embeds.length === 0 &&
			message.applicationId === null &&
			message.resolved === null &&
			message.position === 0 &&
			message.stickers.size === 0 &&
			message.content === ''
		);
	}

	parseTimeToMs(time: string) {
		const matches = time.match(/(\d+)([smhd])/);

		if (!matches) return null;

		const value = parseInt(matches[1]);
		const unit = matches[2];

		switch (unit) {
			case 's':
				return value * 1000;
			case 'm':
				return value * 60 * 1000;
			case 'h':
				return value * 60 * 60 * 1000;
			case 'd':
				return value * 24 * 60 * 60 * 1000;
			default:
				return null;
		}
	}
	parseMsToTime(ms: number) {
		const seconds = Math.floor((ms / 1000) % 60);
		const minutes = Math.floor((ms / (1000 * 60)) % 60);
		const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
		const days = Math.floor(ms / (1000 * 60 * 60 * 24));

		let timeString = '';

		if (days > 0) timeString += `${days} day${days === 1 ? '' : 's'}`;
		if (hours > 0) timeString += `${hours} hour${hours === 1 ? '' : 's'}`;
		if (minutes > 0)
			timeString += `${minutes} minute${minutes === 1 ? '' : 's'}`;
		if (seconds > 0)
			timeString += `${seconds} second${seconds === 1 ? '' : 's'}`;

		return timeString.trim();
	}

	async sendLogs(data: any) {
		const logsData = await logs.findOne({
			guild: data.guild,
		});

		if (!logsData) return;

		const formatEmbed = (): any => {
			switch (data.type) {
				case 'delete-poll':
					return new EmbedBuilder()
						.setTitle('Poll deleted')
						.setDescription(`I deleted a poll in ${data.channel}.`)
						.setThumbnail(data.authorAvatar)
						.addFields([
							{
								name: 'User',
								value: `${data.author}`,
							},
						])
						.setImage(Bars.Grey)
						.setColor(Colors.Main);

				case 'mute':
					return new EmbedBuilder()
						.setTitle('User muted')
						.setDescription(
							'I have muted a user for abusing the polls.'
						)
						.setThumbnail(data.authorAvatar)
						.addFields([
							{
								name: 'User',
								value: `${data.author}`,
							},
							{
								name: 'Punishment ID',
								value: `${data.punishment}`,
							},
							{
								name: 'Time',
								value: data.time,
							},
						])
						.setImage(Bars.Yellow)
						.setColor(Colors.Main);

				case 'kick':
					return new EmbedBuilder()
						.setTitle('User kicked')
						.setDescription(
							'I have kicked a user for abusing the polls.'
						)
						.setThumbnail(data.authorAvatar)
						.addFields([
							{
								name: 'User',
								value: `${data.author}`,
							},
							{
								name: 'Punishment ID',
								value: `${data.punishment}`,
							},
						])
						.setImage(Bars.Orange)
						.setColor(Colors.Main);

				case 'ban':
					return new EmbedBuilder()
						.setTitle('User banned')
						.setDescription(
							'I have banned a user for abusing the polls.'
						)
						.setThumbnail(data.authorAvatar)
						.addFields([
							{
								name: 'User',
								value: `${data.author}`,
							},
							{
								name: 'Punishment ID',
								value: `${data.punishment}`,
							},
						])
						.setImage(Bars.Red)
						.setColor(Colors.Main);
			}
		};

		const logsWebhook = new WebhookClient({
			url: logsData.webhook_url,
		});

		logsWebhook
			.send({
				embeds: [formatEmbed()],
			})
			.catch(() => null);
	}
}
