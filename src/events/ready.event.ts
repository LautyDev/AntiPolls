import { ActivityType, Events, PresenceUpdateStatus } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';

export default new ClientEvent({
	name: Events.ClientReady,
	once: false,
	run: async ({ client }) => {
		client.user?.setPresence({
			status: PresenceUpdateStatus.Online,
			activities: [
				{
					type: ActivityType.Watching,
					name: 'Polls 🎱',
				},
			],
		});

		console.log(
			'[DISCORD]'.magenta,
			`Successfully logged in as ${client.user?.displayName.yellow.bold}.`
		);
	},
});
