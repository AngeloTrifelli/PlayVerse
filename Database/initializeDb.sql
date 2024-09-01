CREATE TABLE IF NOT EXISTS Faq (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS User (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    dateOfBirth DATE NOT NULL,
    points INTEGER NOT NULL,
    credits INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    suspended BIT(1) NOT NULL DEFAULT 0,
    suspensionEnd TIMESTAMP,
    banned BIT(1) NOT NULL DEFAULT 0,
    banReason VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS FriendOf (
    id SERIAL PRIMARY KEY,
    firstUser_id BIGINT UNSIGNED NOT NULL,
    secondUser_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_firstUser_friendOf FOREIGN KEY (firstUser_id) 
        REFERENCES User(id) 
        ON DELETE CASCADE, 
    CONSTRAINT fk_secondUser_friendOf FOREIGN KEY (secondUser_id)
        REFERENCES User(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_Users UNIQUE (firstUser_id, secondUser_id)
);

CREATE TABLE IF NOT EXISTS Message (
    id SERIAL PRIMARY KEY,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED,
    seen BIT(1) NOT NULL DEFAULT 0,
    sent_at TIMESTAMP NOT NULL,
    messageText VARCHAR(1000) NOT NULL,
    isForModerator BIT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_sender_message FOREIGN KEY (sender_id)
        REFERENCES User(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_receiver_message FOREIGN KEY (receiver_id)
        REFERENCES User(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Notification (
    id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    friendRequester_id BIGINT UNSIGNED,
    seen BIT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_user_notification FOREIGN KEY (user_id)
        REFERENCES User(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_friendRequester_notification FOREIGN KEY (friendRequester_id)
        REFERENCES User(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Product (
    code INTEGER PRIMARY KEY,
    description VARCHAR(255),
    photo VARCHAR(255),
    price FLOAT
);

CREATE TABLE IF NOT EXISTS Purchase (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_code INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    purchaseDate DATE NOT NULL,
    CONSTRAINT fk_user_purchase FOREIGN KEY (user_id)
        REFERENCES User(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_purchase FOREIGN KEY (product_code)
        REFERENCES Product(code)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Game (
    name VARCHAR(255) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    disabled BIT(1) NOT NULL DEFAULT 0,
    pointsMultiplier FLOAT
);

CREATE TABLE IF NOT EXISTS PlayedGame (
    id SERIAL PRIMARY KEY,
    game_name VARCHAR(255) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    gameDate TIMESTAMP NOT NULL,
    earnedPoints INTEGER NOT NULL,
    CONSTRAINT fk_game_playedGame FOREIGN KEY (game_name)
        REFERENCES Game(name)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_playedGame FOREIGN KEY (user_id)
        REFERENCES User(id)
        ON DELETE CASCADE
);

