import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Accordion from '../../../components/Accordion';
import JokeItem from '../components/JokeItem';
import Button from '../../../components/Button';
import { useJokes } from '../../../hooks/useJokes';

import styles from './JokesScreenStyle';

const JokesScreen = () => {
  const { categories, loading, refreshing, refreshJokes, addMoreJoke } = useJokes();
  const scrollRef = useRef<ScrollView>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleRefresh = useCallback(async () => {
    await refreshJokes();
    // Reset all accordions to collapsed state after refresh
    setExpandedAccordions({});
  }, [refreshJokes]);

  const handleAccordionToggle = (categoryName: string, isExpanded: boolean) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [categoryName]: isExpanded,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Joke Categories</Text>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} />
        }
      >
        {categories.map((category, index) => (
          <Accordion
            key={category.name}
            number={index + 1}
            title={(category.alias || category.name)}
            isFirst={index === 0}
            onGoToTop={scrollToTop}
            expanded={expandedAccordions[category.name] || false}
            onToggle={(isExpanded) => handleAccordionToggle(category.name, isExpanded)}
          >
            {category.jokes.map((joke) => (
              <JokeItem key={joke.id} joke={joke.joke} />
            ))}
            {!category.isUpdated && category.jokes.length > 0 && !loading && (
              <Button
                title="Add More Jokes"
                onPress={() => addMoreJoke(category.name)}
                style={styles.addButton}
              />
            )}

            {category.jokes.length === 0 && (
              <Text style={styles.emptyText}>There's no joke about {(category.alias || category.name)} </Text>
            )}
          </Accordion>
        ))}

        {categories.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No jokes found</Text>
            <Button title="Refresh" onPress={handleRefresh} style={styles.refreshButton} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default JokesScreen;
