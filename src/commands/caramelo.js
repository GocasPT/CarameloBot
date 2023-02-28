const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('caramelo')
		.setDescription('Show caramelo'),
	async execute(interaction) {
        const folderPath = './src/img/';
        const files = await readdir(folderPath);
        const chooseFile = new AttachmentBuilder(folderPath + files[Math.floor(Math.random() * files.length)]);
		await interaction.reply({ files: [chooseFile] });
	},
};