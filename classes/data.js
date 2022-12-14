import { MongoClient } from "mongodb";

const dbclient = new MongoClient('mongodb://localhost:27017');

(async () => {
    try {
        await dbclient.connect();
    } catch {
        throw 'Database error!';
    };
})();

const db = dbclient.db("PWBot");
const users = db.collection("users");
const guilds = db.collection("guilds");
const appeals = db.collection("appeals");

let lockedIds = [];

class UserData {
    constructor(data){
        this.blocked = data?.blocked ?? false;
        this.points = data?.points ?? 0;
        this.status = data?.status ?? '';
        this.monthlyCooldown = data?.monthlyCooldown ?? Date.now();
        this.settings = {
            locale: data?.settings?.locale ?? "en-GB",
            autoLocale: data?.settings?.autoLocale ?? true
        };
        this.statistics = {
            age: data?.statistics?.age ?? Date.now(),
            spent: data?.statistics?.spent ?? 0,
            earned: data?.statistics?.earned ?? 0,
            commandsUsed: data?.statistics?.commandsUsed ?? 0,
            brawlsWon: data?.statistics?.brawlsWon ?? 0,
            brawlsLost: data?.statistics?.brawlsLost ?? 0,
            tradesCompleted: data?.statistics?.tradesCompleted ?? 0
        };
        this.unlocked = {
            backgrounds: data?.unlocked?.backgrounds ?? ['default_background'],
            frames: data?.unlocked?.frames ?? ['default_frame'],
            roles: data?.unlocked?.roles ?? [],
            features: data?.unlocked?.features ?? []
        };
        this.card = {
            background: data?.card?.background ?? 'default_background',
            frame: data?.card?.frame ?? 'default_frame'
        };
    };

    // Chaining methods:

    setBlocked(boolean = true){
        this.blocked = boolean;
        return this;
    };

    addPoints(points = 0){
        this.points += points;
        if(points > 0) this.statistics.earned += points;
        return this;
    };

    setPoints(points = 0){
        this.points = points;
        return this;
    };

    addReward(reward){
        this.unlocked[reward.type].push(reward.id);
        return this;
    };

    removeReward(reward){
        this.unlocked[reward.type] = this.unlocked[reward.type].filter(r => r != reward.id);
        return this;
    };

    addStatistic(statistic, amount = 1){
        this.statistics[statistic] += amount;
        return this;
    };

    setStatistic(statistic, amount = 0){
        this.statistics[statistic] = amount;
        return this;
    };

    setMonthlyCooldown(time = 0){
        this.monthlyCooldown = time;
        return this;
    };

    setStatus(status = ''){
        this.status = status;
        return this;
    };

    setCardBackground(id = 'default_background'){
        this.card.background = id;
        return this;
    };

    setCardFrame(id = 'default_frame'){
        this.card.frame = id;
        return this;
    };

    setDuelBackground(id = 'default_background'){
        this.duels.background = id;
        return this;
    };

    // Booleans:

    isBlocked(){
        if(this.blocked) return true;
        else return false;
    };

    hasReward(reward){
        if(this.unlocked[reward.type].includes(reward.id)) return true;
        else return false;
    };

    // Utility statics:

    static isLocked(id){
        if(lockedIds.includes(id)) return true;
        else return false;
    };

    static async get(userID){
        const data = await users.findOne({_id: userID});
        return new UserData(data);
    };

    static async set(userID, data){
        await users.updateOne({_id: userID}, {$set: data}, {upsert: true});
        return new UserData(data);
    };

    static async search(query, filter){
        return users.find(query, filter)
    };

    static async searchCount(query){
        return await users.find(query).count();
    };

    static lockIds(ids){
        lockedIds.push(...ids);
        return true;
    };

    static unlockIds(ids){
        lockedIds = lockedIds.filter(id => !ids.includes(id));
        return true;
    };
};

class GuildData {
    constructor(data) {
        this.suggestions = data?.suggestions ?? {};
        this.events = data?.events ?? [];
        this.clanBattles = {
            cooldown: data?.clanBattles?.cooldown ?? 0
        }
        this.fountain = {
            amountSpent: data?.fountain?.amountSpent ?? 0,
            amountGained: data?.fountain?.amountGained ?? 0
        };
    };

    static async get(guildID){
        const data = await guilds.findOne({_id: guildID});
        return new GuildData(data);
    };

    static async set(guildID, data){
        await guilds.updateOne({_id: guildID}, {$set: data}, {upsert: true});
        return new GuildData(data);
    };
};

const AppealStatus = {
    OPEN: 0,
    IN_PROGRESS: 1,
    CLOSED: 2
};

const AppealMessageType = {
    MESSAGE: 0,
    REPLY: 1,
    STATUS: 2
};

class AppealData {
    constructor(data) {
        this.createdAt = data?.createdAt ?? Date.now();
        this.authorId = data?.authorId ?? undefined;
        this.status = data?.status ?? AppealStatus.OPEN;
        this.messages = data?.messages ?? [];
    };

    addMessage(content, authorId, url, type = AppealMessageType.MESSAGE) {
        this.messages.push({content, authorId, url, type, timestamp: Date.now()});
        return this;
    };

    static async filter(authorId = undefined, status = undefined) {
        let filter = {};
        if (authorId != undefined) filter.authorId = authorId;
        if (status != undefined) filter.status = status;
        return appeals.find(filter);
    };

    static async get(id) {
        const data = await appeals.findOne({_id: id});
        return new AppealData(data);
    };

    static async set(id, data) {
        await appeals.updateOne({_id: id}, {$set: data}, {upsert: true});
        return new AppealData(data);
    };
};

export { UserData, GuildData, AppealData, AppealStatus, AppealMessageType };