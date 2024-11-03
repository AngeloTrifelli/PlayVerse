DELIMITER $$

CREATE PROCEDURE insert_data()

BEGIN 
    IF NOT EXISTS (SELECT 1 FROM User LIMIT 1) THEN
        INSERT INTO User VALUES (1, 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'ADMIN', 'adminName', 'adminSurname', '2000-08-27', 0, 10000, '2000-08-27', 0, NULL, 0, NULL);
    END IF;
END $$
INSERT INTO Game (name, description, disabled, pointsMultiplier) VALUES ("Kraft & Slash", "Craft your weapon and fight!", 0, 1);
INSERT INTO Game (name, description, disabled, pointsMultiplier) VALUES ("Nippets", "Hidden Object Game", 0, 1);
INSERT INTO Game (name, description, disabled, pointsMultiplier) VALUES ("Tanuki Sunset", "Raccoons riding longboards on this retro themed relaxing arcade game", 0, 1);
INSERT INTO Game (name, description, disabled, pointsMultiplier) VALUES ("Tiny Truck Racing", "Race tiny trucks around tiny tracks!", 0, 1);
INSERT INTO Game (name, description, disabled, pointsMultiplier) VALUES ("Vampire Survivors", "Mow thousands of night creatures and survive!", 0, 1);
INSERT INTO Game (name, description, disabled, pointsMultiplier) VALUES ("Pumpkin Cafe", "A cozy Halloween themed cooking game", 0, 1);

DELIMITER ;

CALL insert_data();