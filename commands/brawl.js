import { createCanvas, loadImage } from "canvas";
import { readJSON } from "../json.js";
import { randInt } from "../functions.js";
import { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Collection, ApplicationCommandOptionType } from "discord.js";

const backgroundImageBrawl = await loadImage(`./img/duels/backgrounds/brawlarena.png`);
const backgroundImageDuel = await loadImage(`./img/duels/backgrounds/duelarena.png`);
const brawlImage = await loadImage(`./img/duels/brawl.png`);
const duelvsImage = await loadImage(`./img/duels/duelvs.png`);
const healthImage = await loadImage(`./img/duels/health.png`);
const healthMissingImage = await loadImage(`./img/duels/health_missing.png`);
const critImage = await loadImage(`./img/duels/crit.png`);
const dodgeImage = await loadImage(`./img/duels/dodge.png`);
const missImage = await loadImage(`./img/duels/miss.png`);
const winnerImage = await loadImage(`./img/duels/winner.png`);

const duelPositions = [[182, 236], [690, 236]];
const immortals = [];

async function updateFight(battle, {canvas, ctx, duels}, channel){
    if(battle.renderBattle) {
        // Draw first things:
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(battle.members.size === 2 ? backgroundImageBrawl : backgroundImageDuel, 0, 0);
    };
    
    // Duel logic:
    battle.round += 1;
    let logText = '';

    const alivePlayers = await battle.players.filter(p => p.hp > 0);
    const randomChance = randInt(1, 101);

    let attacker = await alivePlayers.random();
    let defender = await alivePlayers.filter(p => p.id != attacker.id).random();
    if(alivePlayers.size < 2) {
        logText = `${alivePlayers.first().username} won!`;
        ctx.drawImage(winnerImage, 0, 0);
    } else {
        if(immortals.includes(defender.id)) {
            logText = `DODGE! ${duels.dodgeText[randInt(0, duels.dodgeText.length)].replaceAll('{attacker}', attacker.username).replaceAll('{defender}', defender.username)}`;
        } else if(randomChance > 85) {
            defender.hp -= 15;
            logText = `CRIT! ${duels.critText[randInt(0, duels.critText.length)].replaceAll('{attacker}', attacker.username).replaceAll('{defender}', defender.username)}`;
        } else if (randomChance > 80){
            logText = `MISS! ${duels.missText[randInt(0, duels.missText.length)].replaceAll('{attacker}', attacker.username).replaceAll('{defender}', defender.username)}`;
        } else if (randomChance > 75){
            logText = `DODGE! ${duels.dodgeText[randInt(0, duels.dodgeText.length)].replaceAll('{attacker}', attacker.username).replaceAll('{defender}', defender.username)}`;
        } else {
            defender.hp -= 10;
            logText = duels.defaultText[randInt(0, duels.defaultText.length)].replaceAll('{attacker}', attacker.username).replaceAll('{defender}', defender.username);
        };
        if(defender.hp < 1) logText = `KILL! ${duels.killText[randInt(0, duels.killText.length)].replaceAll('{attacker}', attacker.username).replaceAll('{defender}', defender.username)}`;
    };

    battle.log.push(logText);

    let i = 0;
    for(const [id, member] of battle.players){
        // Initial checks & values:
        if(member.hp <= 0) continue;
        const x = battle.players.size > 2 ? randInt(20, 860) : duelPositions[i][0];
        const y = battle.players.size > 2 ? randInt(80, 400) : duelPositions[i][1];

        if(!battle.renderBattle) continue;

        // Draw avatar:
        ctx.save(); ctx.beginPath();
        ctx.arc(x + 64, y + 64, 64, 0, Math.PI * 2);
        ctx.closePath(); ctx.clip();
        ctx.drawImage(member.image, x, y, member.image.width * (128/member.image.width), member.image.height * (128/member.image.height));
        ctx.restore();

        // Draw effects (if any):
        if(defender?.id == member.id && randomChance > 85) ctx.drawImage(critImage, x, y);
        else if(defender?.id == member.id && randomChance > 80) ctx.drawImage(missImage, x, y);
        else if(defender?.id == member.id && randomChance > 75) ctx.drawImage(dodgeImage, x, y);

        // Draw name:
        ctx.textAlign = "center";
        ctx.font = '32px "Noto Sans"';
        ctx.fillStyle =
            member.id == attacker.id ? '#FF0000':
            member.id == defender.id ? '#0000FF':
            '#000000';
        ctx.fillText(member.username, x + 64, y - 32, 150);


        // Draw HP:
        ctx.fillStyle = '#080808';
        ctx.fillRect(x - 23, y - 22, 154, 16);

        ctx.fillStyle = ctx.createPattern(healthMissingImage, "repeat-x");
        ctx.fillRect(x - 21, y - 20, 150, 12);

        const hp = Math.floor(member.hp / member.maxHp * 150);
        ctx.fillStyle = ctx.createPattern(healthImage, "repeat-x");
        ctx.fillRect(x - 21, y - 20, hp, 12);

        i += 1;
    };

    if(!battle.renderBattle) {
        return await updateFight(...arguments).then();
    }

    // Draw battle log:
    ctx.font = '40px "Noto Sans"';
    const textData = ctx.measureText(battle.log[battle.log.length - 1]);
    ctx.fillStyle = '#505050BB';
    ctx.fillRect(500 - ((textData.width + 20) / 2), 505, textData.width + 20, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(battle.log[battle.log.length - 1], 500, 550, 950);

    // Return embed:
    const attachment = new AttachmentBuilder(canvas.toBuffer(), 'duel.png');
    const embed = new EmbedBuilder()
        .setTitle(`On-going fight!`)
        .setDescription(`A fight is happening!\nRound: ${battle.round}.\nRound detail: ${battle.log[battle.log.length - 1]}\nPeople alive: ${alivePlayers.size}`)
        .setImage(`attachment://duel.png`)
        .setColor(`#33AA33`)
        .setTimestamp();
    const msg = await channel.send({embeds:[embed], files:[attachment]});

    // Queue next update:
    if(alivePlayers.size > 1 && battle.round < 10000) setTimeout(async () => {
        await updateFight(...arguments).then();
        try {
            await msg.delete();
        } catch {
            return null;
        }
    }, 1000);
};

export const data = {
    name: 'brawl',
    aliases: ['duel', 'brawl'],
    desc: 'Brawl with other members!',
    usage: '/brawl [stats/@member(s))]',
    admin: false,
    options: [
        {
            "name": "member",
            "description": "The member(s) you'd like to brawl with.",
            "type": ApplicationCommandOptionType.User,
            "required": true
        },
        {
            "name": "points",
            "description": "The amount of points to brawl for.",
            "type": ApplicationCommandOptionType.Integer,
            "required": false
        }
    ],
    execute: async ({interaction}) => {
        const self = interaction?.member
        let members = new Collection().set(interaction?.options.getMember('member').id, interaction?.options.getMember('member'))
        members.set(self.id, self);

        if(members.size < 2) return `Ping the member(s) you'd like to brawl with the command!`;

        let battle = {
            round: 0,
            amount: 0,
            log: ['Battle started!'],
            players: new Collection(),
            renderBattle: true
        };

        // Get duel data:
        const duels = await readJSON(`json/duels.json`);

        // Load images:
        
        
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext('2d');

        // Draw first things:
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0);

        let i = 0;
        for(const [snowflake, member] of members){
            // Load member avatar:
            const image = await loadImage(member.user.displayAvatarURL({ format:'png', size:128 }));

            // Set variables:
            battle.players.set(member.id, {
                id: member.id,
                username: member.user.username,
                image: image,
                hp: 100,
                maxHp: 100
            });

            const x = members.size > 2 ? randInt(20, 840) : duelPositions[i][0];
            const y = members.size > 2 ? randInt(80, 400) : duelPositions[i][1];
    
            // Draw avatar:
            ctx.save(); ctx.beginPath();
            ctx.arc(x + 64, y + 64, 64, 0, Math.PI * 2);
            ctx.closePath(); ctx.clip();
            ctx.drawImage(image, x, y, image.width * (128/image.width), image.height * (128/image.height));
            ctx.restore();
    
            // Draw name:
            ctx.textAlign = "center";
            ctx.font = '32px "Noto Sans"';
            ctx.fillText(member.user.username, x + 64, y - 32, 150);

            i += 1;
        };

        // Draw VS:
        if(members.size === 2) ctx.drawImage(duelvsImage, 0, 0);
        else ctx.drawImage(brawlImage, 0, 0);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), 'startduel.png');
        const embed = new EmbedBuilder()
            .setTitle(`Request to fight!`)
            .setDescription(`Press the '✅' button to start the fight!${battle.amount !== 0 ? `\nPrice: ${battle.amount} points.` : ''}`)
            .setImage('attachment://startduel.png')
            .setFooter({text: `This request expires at:`})
            .setTimestamp(Date.now() + 60000)
            .setColor(`#33AA33`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setEmoji('✅')
                .setStyle('SUCCESS')
                .setCustomId('start')
        );
        
        const msg = await message?.channel.send({embeds: [embed], files:[attachment], components: [row]}) ?? await interaction?.reply({embeds:[embed], files:[attachment], components: [row], fetchReply: true});
        const collector = msg.createMessageComponentCollector({filter: int => members.has(int.user.id), time: 60000});
        collector.on('collect', async int => {
            await int.reply({content: "Starting the brawl.", ephemeral: true})
            updateFight(battle, {canvas, ctx, duels}, msg.channel);
            try {
                await msg.delete();
            } catch { return null; }
        });
        collector.on('end', async (collected, reason) => {
            if(reason == 'time') {
                try {
                    await msg.delete();
                } catch { return null; }
            }
        });
    }
};