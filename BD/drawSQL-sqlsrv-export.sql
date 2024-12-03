CREATE TABLE "users"(
    "id" INT NOT NULL,
    "login" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL
);
ALTER TABLE
    "users" ADD CONSTRAINT "users_id_primary" PRIMARY KEY("id");
CREATE TABLE "history"(
    "id" INT NOT NULL,
    "request" VARCHAR(255) NOT NULL,
    "result" VARCHAR(10000) NOT NULL,
    "comment" VARCHAR(1000) NOT NULL,
    "like" INT NOT NULL DEFAULT '0' identity,
    "dislike" INT NOT NULL DEFAULT '0' identity,
    "user_id" INT NOT NULL,
    "source" VARCHAR(55) NOT NULL
);
ALTER TABLE
    "history" ADD CONSTRAINT "history_id_primary" PRIMARY KEY("id");
CREATE INDEX "history_user_id_index" ON
    "history"("user_id");
ALTER TABLE
    "history" ADD CONSTRAINT "history_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");