import SQLite from 'react-native-sqlite-storage';
import {Joke} from '../api/JokesService';

// Enable promise-based API
SQLite.enablePromise(true);

export interface StoredJoke {
  id: number;
  category: string;
  joke: string;
  isCustom: boolean;
}

export interface Category {
  name: string;
  alias: string | null;
}

class SQLiteService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDB(): Promise<SQLite.SQLiteDatabase> {
    try {
      if (this.database) {
        return this.database;
      }

      this.database = await SQLite.openDatabase({
        name: 'JokesDB.db',
        location: 'default',
      });

      await this.createTables();
      return this.database;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createTables(): Promise<void> {
    const db = await this.initDB();
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS jokes (
        id INTEGER PRIMARY KEY,
        category TEXT NOT NULL,
        joke TEXT NOT NULL,
        isCustom INTEGER NOT NULL DEFAULT 0,
        timestamp INTEGER
      );
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        alias TEXT
      );
    `);
  }

  async saveJokes(jokes: Joke[], isCustom: boolean = false): Promise<void> {
    try {
      const db = await this.initDB();
      const insertQuery =
        'INSERT OR REPLACE INTO jokes (id, category, joke, isCustom, timestamp) VALUES (?, ?, ?, ?, ?)';
      const currentTimestamp = Date.now();

      for (const joke of jokes) {
        await db.transaction(async tx => {
          await tx.executeSql(insertQuery, [
            joke.id,
            joke.category,
            joke.joke,
            isCustom ? 1 : 0,
            currentTimestamp,
          ]);
        });
      }
    } catch (error) {
      console.error('Error saving jokes to database:', error);
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      const db = await this.initDB();
      const upsertQuery = 'REPLACE INTO categories (name, alias) VALUES (?, ?)';

      for (const category of categories) {
        await db.transaction(async tx => {
          await tx.executeSql(upsertQuery, [category.name, category.alias]);
        });
      }
    } catch (error) {
      console.error('Error saving categories to database:', error);
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const db = await this.initDB();

      const [results] = await db.executeSql(
        'SELECT name, alias FROM categories',
      );
      const categories: Category[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const item = results.rows.item(i);
        categories.push({
          name: item.name,
          alias: item.alias,
        });
      }
      return categories;
    } catch (error) {
      console.error('Error getting categories from database:', error);
      return [];
    }
  }

  async getJokesByCategory(categoryInfo: Category): Promise<StoredJoke[]> {
    const dbCategory = categoryInfo.name;
    const db = await this.initDB();
    const [results] = await db.executeSql(
      'SELECT * FROM jokes WHERE category = ? ORDER BY timestamp ASC',
      [dbCategory],
    );

    const jokes: StoredJoke[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const joke = results.rows.item(i);
      jokes.push({
        id: joke.id,
        category: categoryInfo.name,
        joke: joke.joke,
        isCustom: !!joke.isCustom,
      });
    }
    return jokes;
  }

  async clearAllJokes(): Promise<void> {
    const db = await this.initDB();
    await db.executeSql('DELETE FROM jokes');
  }

  async clearAllCategories(): Promise<void> {
    const db = await this.initDB();
    await db.executeSql('DELETE FROM categories');
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}

export default new SQLiteService();
