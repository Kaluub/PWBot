CREATE TYPE appeal_state AS ENUM ('open', 'allow_replies', 'closed');
CREATE TYPE appeal_reply_type AS ENUM ('reply', 'status');
CREATE TYPE action_type AS ENUM ('mute', 'kick', 'ban', 'strike');

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

CREATE TABLE action_log (
    action_id SERIAL PRIMARY KEY,
    action_type action_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    target_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT,
    log_message_id TEXT
);

CREATE TABLE temp_ban (
    action_id INTEGER UNIQUE PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    duration INTEGER NOT NULL
);

CREATE TABLE temp_mute (
    action_id INTEGER UNIQUE PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    duration INTEGER NOT NULL
);