DELIMITER $$

CREATE PROCEDURE insert_data()

BEGIN 
    IF NOT EXISTS (SELECT 1 FROM User LIMIT 1) THEN
        INSERT INTO User VALUES (1, 'admin', 'admin', 'ADMIN', 'adminName', 'adminSurname', '2000-08-27', 0, 10000, '2000-08-27', 0, NULL, 0, NULL);
    END IF;
END $$

DELIMITER ;

CALL insert_data();