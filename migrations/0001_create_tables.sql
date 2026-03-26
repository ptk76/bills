-- Migration number: 0001 	 2024-12-27T22:04:18.794Z

-- Friends
CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY NOT NULL,
    nick TEXT NOT NULL
);

INSERT INTO friends (nick)
VALUES
    ('Dyzio'),
    ('Gucio'),
    ('Zosia'),
    ('Gertruda'),
    ('Helgonia')
;

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    paid_by INTEGER
);

INSERT INTO bills (title)
VALUES
    ('Konoba Mario'),
    ('Rakija'),
    ('Opłaty portowe')
;

-- Items
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    bill_id INTEGER NOT NULL,
    split_id INTEGER 
);

INSERT INTO items (title,price,quantity,bill_id)
VALUES
    ('Hobotnica', 30, 2, 1),
    ('Piwo', 5, 10, 1),
    ('Ser', 10, 3, 1),
    ('Czysta', 25, 2, 2),
    ('Trawarica', 30, 3, 2),
    ('Split', 70, 1, 3),
    ('Sweta N', 35, 1, 3)
;

-- Splits
CREATE TABLE IF NOT EXISTS splits (
    id INTEGER PRIMARY KEY NOT NULL,
    item_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL
);

-- Returns
CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY NOT NULL,
    from_friend_it INTEGER NOT NULL,
    to_friend_id INTEGER NOT NULL,
    title TEXT,
    amount INTEGER NOT NULL
);
