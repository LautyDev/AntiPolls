import { ChatInputCommandInteraction } from 'discord.js';
import { BotClient } from './BotClient';
import { ReplyClient } from './ReplyClient';

export interface ICommandRunContext {
	client: BotClient;
	interaction: ChatInputCommandInteraction;
	reply: ReplyClient;
}

export class CommandRunContext implements ICommandRunContext {
	client: BotClient;
	interaction: ChatInputCommandInteraction;
	reply: ReplyClient;

	constructor({ client, interaction, reply }: ICommandRunContext) {
		this.client = client;
		this.interaction = interaction;
		this.reply = reply;
	}
}
