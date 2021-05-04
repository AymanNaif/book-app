DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books(
    id SERIAL PRIMARY KEY,
    img_url VARCHAR(255),
    title VARCHAR(255),
    authors VARCHAR(255),
    description VARCHAR(255)  
);
