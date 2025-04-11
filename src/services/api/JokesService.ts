import apiService from './AxiosConfig';

export interface CategoryResponse {
  error: boolean;
  categories: string[];
  categoryAliases: {
    alias: string;
    resolved: string;
  }[];
  timestamp: number;
}

export interface Joke {
  category: string;
  type: string;
  joke: string;
  flags: {
    nsfw: boolean;
    religious: boolean;
    political: boolean;
    racist: boolean;
    sexist: boolean;
    explicit: boolean;
  };
  id: number;
  safe: boolean;
  lang: string;
}

export interface JokesResponse {
  error: boolean;
  amount: number;
  jokes: Joke[];
}

class JokesService {
  async fetchCategories(): Promise<CategoryResponse> {
    try {
      const response = await apiService.get<CategoryResponse>(
        '/categories?format=json',
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async fetchJokesByCategory(
    category: string,
    amount: number = 2,
    nextPage: boolean = false,
  ): Promise<Joke[]> {
    try {
      const response = await apiService.get<JokesResponse>(
        `/joke/${category}?type=single&amount=${amount}${
          nextPage ? '&idRange=2-100' : ''
        }`,
      );

      return response.jokes;
    } catch (error) {
      return [];
    }
  }
}

export default new JokesService();
