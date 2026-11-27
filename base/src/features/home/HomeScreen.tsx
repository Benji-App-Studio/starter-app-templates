import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, Screen, Text } from '@/components';
import { createEntry, deleteEntry, listEntries, type Entry } from '@/db/entries';
import { useTheme } from '@/theme/theme';

/**
 * Placeholder core screen. A niche template replaces this file with its own
 * feature; the list below only shows the database and component pattern.
 */
export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const [entries, setEntries] = useState<Entry[]>();

  const refresh = useCallback(() => {
    listEntries().then(setEntries);
  }, []);

  useEffect(refresh, [refresh]);

  async function handleAdd() {
    await createEntry(`Entry ${(entries?.length ?? 0) + 1}`);
    refresh();
  }

  async function handleDelete(id: number) {
    await deleteEntry(id);
    refresh();
  }

  if (!entries) {
    return <Screen edges={['top']}>{null}</Screen>;
  }

  if (entries.length === 0) {
    return (
      <Screen edges={['top']}>
        <EmptyState
          icon="document-text-outline"
          title="Nothing here yet"
          body="Entries you add are stored on this device."
          action={{ title: 'Add an entry', onPress: handleAdd }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} footer={<Button title="Add an entry" onPress={handleAdd} />}>
      <Text variant="title" style={{ marginBottom: spacing.md }}>
        Home
      </Text>
      <FlatList
        data={entries}
        keyExtractor={(entry) => String(entry.id)}
        contentContainerStyle={{ gap: spacing.sm }}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.body}>
                <Text variant="label">{item.title}</Text>
                <Text variant="caption" color="muted">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Delete ${item.title}`}
                hitSlop={8}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, gap: 2 },
});
