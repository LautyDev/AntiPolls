import { Client, REST, Routes } from 'discord.js';
import { ClientUtil } from './ClientUtil';
import { EventManager } from '../managers/eventManager';
import { EventHandler } from '../handlers/eventHandler';
import { CommandManager } from '../managers/commandManager';

export class BotClient extends Client {
	util = new ClientUtil();

	eventHandler = new EventHandler(this);

	managers = {
		eventManager: new EventManager(),
		commandManager: new CommandManager(),
	};

	async setup() {
		this.eventHandler.start();

		const token = process.env['TOKEN'] as string;

		const rest = new REST().setToken(token);

		await rest.put(
			Routes.applicationCommands(process.env['CLIENT_ID'] ?? ''),
			{
				body: [
					...this.managers.commandManager
						.getCommands()
						.map((cmd) => cmd.getConfig({ client: this }).slash),
				],
			}
		);

		console.log('[COMMANDS]'.red, 'Commands posted successfully.');

		super.login(token);
	}
}
