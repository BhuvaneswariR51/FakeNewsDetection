import sqlite3

try:
    conn = sqlite3.connect('backend/database/history.db')
    c = conn.cursor()
    c.execute("UPDATE news_history SET result='Real' WHERE result='0'")
    c.execute("UPDATE news_history SET result='Fake' WHERE result='1'")
    conn.commit()
    print('DB updated successfully')
except Exception as e:
    print('Error:', e)
finally:
    if conn:
        conn.close()
