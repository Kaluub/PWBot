CREATE TYPE appeal_state AS ENUM ('open', 'allow_replies', 'closed');
CREATE TYPE appeal_reply_type AS ENUM ('reply', 'status');

CREATE TABLE appeal (
    appeal_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    message_id TEXT NOT NULL UNIQUE,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    appeal_state appeal_state NOT NULL DEFAULT 'open'
);

CREATE TABLE appeal_reply (
    reply_id SERIAL PRIMARY KEY,
    appeal_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    appeal_reply_type appeal_reply_type NOT NULL DEFAULT 'reply'
);

CREATE TABLE blacklist (
    user_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);