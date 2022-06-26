import { MessageEmbed, MessageActionRow } from "discord.js";
import { createCanvas, loadImage } from "canvas";
import { readJSON } from "./json.js";

// Creates the profile card:
async function createProfileCard(member, rewards, userdata){
    const canvas = createCanvas(1000,350);
    const ctx = canvas.getContext('2d');

    const backgroundData = rewards[userdata.card.background];
    const frameData = rewards[userdata.card.frame];

    // Load images:
    const avatar = await loadImage(member.user.displayAvatarURL({format:'png',size:256}));
    const background = await loadImage(`./img/backgrounds/${backgroundData.img}`);
    const frame = await loadImage(`./img/frames/${frameData.img}`);

    // Draw background:
    ctx.drawImage(background, 0, 0, background.width * (1000/background.width), background.height * (350/background.height));

    // Draw PFP in a circle:
    ctx.save(); ctx.beginPath();
    ctx.arc(175, 175, 128, 0, Math.PI * 2, true);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(avatar, 47, 47, avatar.width * (256/avatar.width), avatar.height * (256/avatar.height));
    ctx.restore();

    // Draw frame:
    ctx.drawImage(frame, 25, 25);

    // Effects? Draw them:
    if(backgroundData.effects) {
        const effects = await readJSON('json/effects.json');
        for (const effect of backgroundData.effects) {
            const effectData = effects[effect.type];
            const effectImage = await loadImage(`./img/effects/${effectData.img}`);
            for (let i = 1; i <= effect.count; i++) {
                const x = randInt(0, 1000 - effectImage.width);
                const y = randInt(0, 350 - effectImage.height);
                ctx.drawImage(effectImage, x, y);
            };
        };
    };

    // Draw text:
    ctx.font = 'bold 40px "Noto Sans"';
    ctx.fillStyle = member.displayHexColor == '#000000' ? '#FFFFFF' : member.displayHexColor;
    ctx.fillText(`${member.user.tag}`, 336, 42, 636);
    ctx.fillStyle = '#000000';
    ctx.strokeText(`${member.user.tag}`, 336, 42, 636);

    // Role icon if present
    if(member.roles.icon) {
        const nameSize = ctx.measureText(member.user.tag);
        const roleIconImage = await loadImage(member.roles.icon.iconURL({format: "png", size: 32}));
        ctx.drawImage(roleIconImage, 340 + nameSize.width, 12);
    };

    ctx.fillStyle = '#505050BB';
    ctx.fillRect(336, 58, 640, 44); // Status
    ctx.fillRect(336, 108, 318, 44); // Points
    ctx.fillRect(658, 108, 318, 44); // Total earned
    ctx.fillRect(336, 158, 552, 140); // Badges
    
    ctx.font = '32px "Noto Sans"';
    ctx.fillStyle = backgroundData.colour;
    ctx.fillText(`Points: ${userdata.points > 999999999 ? '∞' : userdata.points}`, 344, 140, 310);
    ctx.fillText(`Total earned: ${userdata.statistics.earned > 999999999 ? '∞' : userdata.statistics.earned}`, 666, 140, 310);

    if(userdata.status.length > 0) ctx.fillText(`${userdata.status}`, 344, 90, 636);
    else ctx.fillText(`No custom status.`, 344, 90, 636);

    // Badges:
    let badges = await readJSON('json/badges.json');
    let bx = 0, by = 0;
    for(const i in badges.badges){
        let badge = badges.badges[i];
        let renderBadge = await member.roles.cache.some(role => badge.roles.includes(role.id));
        if(renderBadge){
            let badgeImage = await loadImage(`./img/badges/${badge.img}`);
            ctx.drawImage(badgeImage, 340 + bx, 162 + by);
            bx += 68;
            if(bx >= 544) bx = 0, by += 68;
        };
    };

    // Return buffer:
    return canvas.toBuffer();
};

// Updates a suggestion embed (used multiple times, so a function helped)
async function updateSuggestion(data, message){
    const net = data.positive - data.negative;
    let color = '#222277';
    if(net > 9) color = '#55FF55';
    else if(net > 2) color = '#22BB22';
    else if(net < -2) color = '#BB2222';
    else if(net < -9) color = '#FF5555';

    const fields = [{name: 'Rating:', value: `${data.positive} positive ratings\n${data.negative} negative ratings\n${data.voters.length} voter(s)`}];
    if(data.notes?.length){
        let string = ``;
        for(const note of data.notes){
            string += `${note}\n\n`;
        };
        if(string.length > 1000) string = string.slice(0, 1000) + `...`;
        fields.push({name: 'Notes:', value: string});
    };
    if(data.staffnote?.length) fields.push({name: `❗ Staff note: <t:${data.staffnoteTime}> ❗`, value: data.staffnote});
    await message.edit({components: [
        new MessageActionRow(message.components[0])
    ], embeds: [
        new MessageEmbed(message.embeds[0])
            .setFields(fields)
            .setColor(color)
    ]});
};

// Helper for random integer between 2 specific values
function randInt(min = 0, max = 1){
    return Math.floor(Math.random() * (max - min)) + min;
};

export { updateSuggestion, randInt, createProfileCard };