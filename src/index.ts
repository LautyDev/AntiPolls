import { BotClient } from './classes/BotClient';
import { GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import 'colors';

// Dotenv config
dotenv.config({
	path:
		process.env['NODE_ENV'] === 'production'
			? '.env.production'
			: '.env.development',
});

import './mongo';

const client = new BotClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.setup();
