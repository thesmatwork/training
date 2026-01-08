import asyncpg
import asyncio

async def connect_db():
    try:
        conn = await asyncpg.connect(
            user='postgres',
            password='postgres',
            database='postgres',
            host='localhost',
            port='5432'
        )
        return conn
    except Exception as e:
        print("Error connecting to database:", e)
        return None

async def fetch_all_rows(conn, seq):
    try:
        rows = await conn.fetch("SELECT * FROM details;")
        print(seq + "Current data in 'details':")
        for row in rows:
            print(dict(row))
    except Exception as e:
        print("Error fetching rows:", e)

async def insert_row(conn, name, salary):
    try:
        result = await conn.fetchrow(
            "INSERT INTO details (name, salary) VALUES ($1, $2) RETURNING id;",
            name, salary
        )
        print(f"Inserted row with id {result['id']}")
    except Exception as e:
        print("Error inserting row:", e)

async def update_salary(conn, name, new_salary):
    try:
        await conn.execute(
            "UPDATE details SET salary = $1 WHERE name = $2;",
            new_salary, name
        )
        print(f"Updated salary for {name} to {new_salary}")
    except Exception as e:
        print("Error updating salary:", e)

async def delete_row(conn, name):
    try:
        await conn.execute(
            "DELETE FROM details WHERE name = $1;",
            name
        )
        print(f"Deleted row with name {name}")
    except Exception as e:
        print("Error deleting row:", e)

async def main():
    conn = await connect_db()
    if not conn:
        return

    await fetch_all_rows(conn, 1)
    print("fetch is complete")

    await insert_row(conn, "Alice", 75000)
    await fetch_all_rows(conn)
    print("fetch after insert complete")

    await update_salary(conn, "Alice", 80000)
    await fetch_all_rows(conn)

    await delete_row(conn, "Alice")
    await fetch_all_rows(conn)

    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
