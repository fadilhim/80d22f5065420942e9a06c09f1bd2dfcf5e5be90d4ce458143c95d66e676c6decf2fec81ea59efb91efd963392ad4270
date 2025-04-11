import {useState, useEffect, useCallback} from 'react';
import JokesService from '../services/api/JokesService';
import SQLiteService, {
  StoredJoke,
  Category,
} from '../services/storage/SQLiteService';

export interface CategoryWithJokes {
  name: string;
  alias: string | null;
  jokes: StoredJoke[];
  isUpdated: boolean;
}

export const useJokes = () => {
  const [categoryJokes, setCategoryJokes] = useState<CategoryWithJokes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadJokesFromDb = useCallback(async () => {
    try {
      const dbCategories = await SQLiteService.getAllCategories();
      const categoriesData: CategoryWithJokes[] = await Promise.all(
        dbCategories.map(async category => {
          const jokes = await SQLiteService.getJokesByCategory(category);
          return {
            name: category.name,
            alias: category.alias,
            jokes: jokes,
            isUpdated: jokes.length > 2,
          };
        }),
      );
      setCategoryJokes(categoriesData);
    } catch (err) {
      console.error('Error loading jokes from DB:', err);
      setError('Failed to load jokes from storage.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategoriesAndJokes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear existing jokes in DB
      await SQLiteService.clearAllJokes();
      await SQLiteService.clearAllCategories();

      // Fetch categories
      const response = await JokesService.fetchCategories();

      // Filter out "Any" category
      const fetchedCategories = response.categories.filter(
        category => category !== 'Any',
      );

      // Create categories with aliases
      const categoryObjects: Category[] = fetchedCategories.map(category => {
        const aliasObj = response.categoryAliases?.find(
          item => item.resolved === category,
        );
        if (aliasObj) {
          return {
            name: category,
            alias: aliasObj.alias,
          };
        } else {
          return {
            name: category,
            alias: null,
          };
        }
      });

      // Save categories to DB
      await SQLiteService.saveCategories(categoryObjects);

      // Fetch jokes for each category and save to SQLite
      for (const category of categoryObjects) {
        // Use the API category alias (if any) or name (if no alias) for fetching
        const apiCategory = category.alias || category.name;
        const jokes = await JokesService.fetchJokesByCategory(apiCategory);

        await SQLiteService.saveJokes(jokes);
      }

      await loadJokesFromDb();
    } catch (err) {
      console.error('Error fetching jokes:', err);
      setError('Failed to fetch jokes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadJokesFromDb]);

  const refreshJokes = useCallback(async () => {
    setRefreshing(true);
    await fetchCategoriesAndJokes();
  }, [fetchCategoriesAndJokes]);

  const addMoreJoke = useCallback(
    async (category: string) => {
      try {
        setLoading(true);
        setError(null);

        // Find the category object to get the API category name
        const categoryObj = categoryJokes.find(cat => cat.name === category);
        if (!categoryObj) {
          throw new Error(`Category ${category} not found`);
        }

        const apiCategory = categoryObj.name;

        const newJokes = await JokesService.fetchJokesByCategory(
          apiCategory,
          2,
          true,
        );

        if (newJokes.length > 0) {
          await SQLiteService.saveJokes(newJokes, true);

          await loadJokesFromDb();
        }
      } catch (err) {
        console.error('Error adding more jokes:', err);
        setError('Failed to add more jokes.');
      } finally {
        setLoading(false);
      }
    },
    [categoryJokes, loadJokesFromDb],
  );

  // Load jokes on initial mount
  useEffect(() => {
    const initJokes = async () => {
      await SQLiteService.initDB();
      // Check if we have categories in DB. if not, fetch from API
      const dbCategories = await SQLiteService.getAllCategories();

      if (dbCategories.length === 0) {
        await fetchCategoriesAndJokes();
      } else {
        await loadJokesFromDb();
      }
    };

    initJokes();
  }, [fetchCategoriesAndJokes, loadJokesFromDb]);

  return {
    categories: categoryJokes,
    loading,
    error,
    refreshing,
    refreshJokes,
    addMoreJoke,
  };
};
