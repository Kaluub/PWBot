import pg from "pg";
import config from "./config.js";

class Storage {
    constructor() {
        this.client = new pg.Client({
            host: config.postgres_host,
            port: config.postgres_port,
            user: config.postgres_user,
            password: config.postgres_password,
            database: config.postgres_database
        });
    }

    async startClient() {
        await this.client.connect();
    }

    async getAppeal(messageId) {
        const result = await this.client.query(
            "SELECT * FROM appeal WHERE message_id = $1::text",
            [messageId]
        );
        return result.rows[0];
    }

    async countAppealsFromUser(authorId) {
        const result = await this.client.query(
            "SELECT TRUE FROM appeal WHERE author_id = $1::text",
            [authorId]
        );
        return result.rowCount;
    }

    async createAppeal(messageId, authorId, content) {
        await this.client.query(
            "INSERT INTO appeal (message_id, author_id, content) VALUES ($1::text, $2::text, $3::text)",
            [messageId, authorId, content]
        );
    }

    async setAppealState(messageId, state) {
        const result = await this.client.query(
            "UPDATE appeal SET appeal_state = $2::text::appeal_state WHERE message_id = $1::text RETURNING *",
            [messageId, state]
        );
        return result.rows[0];
    }

    async getAppealReplies(appealId) {
        const result = await this.client.query(
            "SELECT * FROM appeal_reply WHERE appeal_id = $1::integer",
            [appealId]
        );
        return result.rows;
    }

    async createAppealReply(appealId, authorId, content, replyType) {
        await this.client.query(
            "INSERT INTO appeal_reply (appeal_id, author_id, content, appeal_reply_type) VALUES ($1::integer, $2::text, $3::text, $4::text::appeal_reply_type)",
            [appealId, authorId, content, replyType]
        );
    }

    async isBlacklisted(userId) {
        const result = await this.client.query(
            "SELECT TRUE FROM blacklist WHERE user_id = $1::text",
            [userId]
        );
        return result.rowCount > 0;
    }

    async addBlacklisted(userId) {
        await this.client.query(
            "INSERT INTO blacklist (user_id) VALUES ($1::text)",
            [userId]
        );
    }

    async removeBlacklisted(userId) {
        await this.client.query(
            "DELETE FROM blacklist WHERE user_id = $1::text",
            [userId]
        );
    }
}

export default Storage;