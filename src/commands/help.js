const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Help menu'),
	async execute(interaction) {
        const folderPath = './src/commands/';
        const commands = await readdir(folderPath);
        const embedHelpMenu = new EmbedBuilder()
            .setTitle('Help Menu')
            .setDescription('Lista de comandos com as suas descrições:')
            .setColor(0xc78628);

        for (const file of commands) {
            const command = require(`./${file}`);
            embedHelpMenu.addFields({ name: `${command.data.name}`, value: `${command.data.description}`})
        }

		await interaction.reply({ embeds: [embedHelpMenu] });
	},
};