import psycopg2

conn = psycopg2.connect(
    dbname="managementappdb",
    user="postgre",
    password="postpw99",
    host="localhost",
    port=5432
)
print("Connected!")
conn.close()
