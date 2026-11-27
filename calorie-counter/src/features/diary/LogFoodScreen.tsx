import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Screen, ScreenHeader, Stack, Stepper, Text, TextField } from '@/components';
import { createFoodLog, type Meal, type NewFoodLog } from '@/db/foodLogs';
import { spacing as grid, useTheme } from '@/theme/theme';

import { searchFoods, type Food } from './foods';
import { MEALS, mealLabel } from './meals';
import { foodScanner, type FoodEstimate } from './scan';
import { formatKcal } from './totals';

const RESULT_LIMIT = 8;
const SERVING_STEP = 0.5;
const SERVING_MAX = 10;

type LogFoodScreenProps = {
  day: string;
  initialMeal: Meal;
};

type ManualForm = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

const emptyForm: ManualForm = { name: '', calories: '', protein: '', carbs: '', fat: '' };

function parseGrams(text: string): number | undefined {
  if (text.trim() === '') {
    return 0;
  }
  const value = Number(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function MealPicker({ value, onChange }: { value: Meal; onChange: (meal: Meal) => void }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md }]}
    >
      {MEALS.map((meal) => {
        const selected = meal.id === value;
        return (
          <Pressable
            key={meal.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(meal.id);
            }}
            style={[
              styles.pickerItem,
              {
                backgroundColor: selected ? colors.text : 'transparent',
                borderRadius: radii.sm,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text variant="caption" style={{ color: selected ? colors.background : colors.textMuted }}>
              {meal.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The log sheet: pick a food from the built-in list or type the numbers by hand. */
export function LogFoodScreen({ day, initialMeal }: LogFoodScreenProps) {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const [meal, setMeal] = useState<Meal>(initialMeal);
  const [query, setQuery] = useState('');
  const [food, setFood] = useState<Food>();
  const [servings, setServings] = useState(1);
  const [manual, setManual] = useState(false);
  const [form, setForm] = useState<ManualForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const results = searchFoods(query, RESULT_LIMIT);
  const mealName = mealLabel(meal).toLowerCase();

  async function save(input: NewFoodLog) {
    setSaving(true);
    try {
      await createFoodLog(input);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again.');
    }
  }

  function saveFood() {
    if (!food) {
      return;
    }
    void save({
      day,
      meal,
      name: food.name,
      servings,
      calories: Math.round(food.calories * servings),
      protein: food.protein * servings,
      carbs: food.carbs * servings,
      fat: food.fat * servings,
    });
  }

  function saveManual() {
    const calories = Number(form.calories.replace(',', '.'));
    const protein = parseGrams(form.protein);
    const carbs = parseGrams(form.carbs);
    const fat = parseGrams(form.fat);
    if (!Number.isFinite(calories) || calories <= 0) {
      Alert.alert('Calories needed', 'Enter the calories for this food.');
      return;
    }
    if (protein === undefined || carbs === undefined || fat === undefined) {
      Alert.alert('Check the grams', 'Protein, carbs and fat must be numbers, or left empty.');
      return;
    }
    void save({
      day,
      meal,
      name: form.name.trim() || 'Quick add',
      servings: 1,
      calories: Math.round(calories),
      protein,
      carbs,
      fat,
    });
  }

  function applyEstimate(estimate: FoodEstimate) {
    setForm({
      name: estimate.name,
      calories: String(Math.round(estimate.calories)),
      protein: String(Math.round(estimate.protein)),
      carbs: String(Math.round(estimate.carbs)),
      fat: String(Math.round(estimate.fat)),
    });
    setManual(true);
  }

  async function scan() {
    if (!foodScanner) {
      return;
    }
    const estimate = await foodScanner.scan().catch(() => null);
    if (estimate) {
      applyEstimate(estimate);
    }
  }

  const manualValid = Number(form.calories.replace(',', '.')) > 0;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        scroll
        edges={['bottom']}
        footer={
          food ? (
            <Button title={`Add to ${mealName}`} onPress={saveFood} loading={saving} />
          ) : manual ? (
            <Button title={`Add to ${mealName}`} onPress={saveManual} loading={saving} disabled={!manualValid} />
          ) : undefined
        }
      >
        <Stack gap="lg" style={{ paddingTop: spacing.sm }}>
          <ScreenHeader title="Log food" onClose={() => router.back()} />

          <MealPicker value={meal} onChange={setMeal} />

          {food ? (
            <View style={{ gap: spacing.md }}>
              <Card>
                <View style={[styles.selectedRow, { gap: spacing.md }]}>
                  <View style={styles.grow}>
                    <Text variant="heading" numberOfLines={2}>
                      {food.name}
                    </Text>
                    <Text variant="caption" color="muted">
                      {food.serving} · {formatKcal(food.calories)} kcal
                    </Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Choose another food" hitSlop={8} onPress={() => setFood(undefined)}>
                    <Text variant="caption" color="primary">
                      Change
                    </Text>
                  </Pressable>
                </View>
                <View style={[styles.servingsRow, { paddingTop: spacing.lg, gap: spacing.md }]}>
                  <Text variant="label" style={styles.grow}>
                    Servings
                  </Text>
                  <Stepper
                    label="servings"
                    value={String(servings)}
                    onDecrement={() => setServings((value) => Math.max(SERVING_STEP, value - SERVING_STEP))}
                    onIncrement={() => setServings((value) => Math.min(SERVING_MAX, value + SERVING_STEP))}
                    canDecrement={servings > SERVING_STEP}
                    canIncrement={servings < SERVING_MAX}
                  />
                </View>
                <View style={[styles.totals, { marginTop: spacing.md, paddingTop: spacing.md, gap: spacing.sm, borderTopColor: colors.border }]}>
                  <Total label="kcal" value={food.calories * servings} color={colors.text} big />
                  <Total label="protein" value={food.protein * servings} color={colors.protein} />
                  <Total label="carbs" value={food.carbs * servings} color={colors.carbs} />
                  <Total label="fat" value={food.fat * servings} color={colors.fat} />
                </View>
              </Card>
            </View>
          ) : manual ? (
            <View style={{ gap: spacing.md }}>
              <TextField
                label="Food"
                placeholder="What did you eat?"
                value={form.name}
                onChangeText={(name) => setForm({ ...form, name })}
                autoCapitalize="sentences"
                returnKeyType="next"
              />
              <TextField
                label="Calories"
                suffix="kcal"
                placeholder="0"
                value={form.calories}
                onChangeText={(calories) => setForm({ ...form, calories })}
                keyboardType="number-pad"
              />
              <View style={[styles.macroFields, { gap: spacing.sm }]}>
                <View style={styles.grow}>
                  <TextField label="Protein" suffix="g" placeholder="0" value={form.protein} onChangeText={(protein) => setForm({ ...form, protein })} keyboardType="decimal-pad" />
                </View>
                <View style={styles.grow}>
                  <TextField label="Carbs" suffix="g" placeholder="0" value={form.carbs} onChangeText={(carbs) => setForm({ ...form, carbs })} keyboardType="decimal-pad" />
                </View>
                <View style={styles.grow}>
                  <TextField label="Fat" suffix="g" placeholder="0" value={form.fat} onChangeText={(fat) => setForm({ ...form, fat })} keyboardType="decimal-pad" />
                </View>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setManual(false)} style={{ alignSelf: 'center', padding: spacing.sm }}>
                <Text variant="caption" color="primary">
                  Back to the food list
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              <TextField
                label="Food"
                placeholder="Search the food list"
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
              <View style={[styles.actions, { gap: spacing.sm }]}>
                <SecondaryAction icon="pencil" title="Enter by hand" onPress={() => setManual(true)} />
                {foodScanner ? <SecondaryAction icon="camera" title={foodScanner.label} onPress={() => void scan()} /> : null}
              </View>
              <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                {results.length === 0 ? (
                  <View style={{ padding: spacing.md }}>
                    <Text color="muted">Nothing in the list matches. Enter it by hand instead.</Text>
                  </View>
                ) : (
                  results.map((result, index) => (
                    <Pressable
                      key={result.id}
                      accessibilityRole="button"
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setServings(1);
                        setFood(result);
                      }}
                      style={({ pressed }) => [
                        styles.resultRow,
                        {
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.ms,
                          gap: spacing.md,
                          opacity: pressed ? 0.6 : 1,
                          borderBottomWidth: index === results.length - 1 ? 0 : StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.grow}>
                        <Text variant="label" numberOfLines={1}>
                          {result.name}
                        </Text>
                        <Text variant="caption" color="muted">
                          {result.serving}
                        </Text>
                      </View>
                      <Text variant="label" style={styles.tabular}>
                        {formatKcal(result.calories)}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          )}
        </Stack>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Total({ label, value, color, big = false }: { label: string; value: number; color: string; big?: boolean }) {
  return (
    <View style={styles.total}>
      <Text variant={big ? 'stat' : 'label'} style={[styles.tabular, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {big ? formatKcal(value) : `${Math.round(value)} g`}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

function SecondaryAction({ icon, title, onPress }: { icon: 'pencil' | 'camera'; title: string; onPress: () => void }) {
  const { colors, radii, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondary,
        {
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingVertical: spacing.ms,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Icon name={icon} size={16} color={colors.text} />
      <Text variant="label">{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flex: 1, minWidth: 0 },
  picker: { flexDirection: 'row', padding: grid.xs, borderWidth: 1 },
  pickerItem: { flex: 1, alignItems: 'center', minHeight: 40, justifyContent: 'center' },
  selectedRow: { flexDirection: 'row', alignItems: 'flex-start' },
  servingsRow: { flexDirection: 'row', alignItems: 'center' },
  totals: { flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: StyleSheet.hairlineWidth },
  total: { flex: 1, minWidth: 0, alignItems: 'flex-start', gap: grid.xs },
  macroFields: { flexDirection: 'row' },
  resultRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  actions: { flexDirection: 'row' },
  secondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, minHeight: 48 },
  tabular: { fontVariant: ['tabular-nums'] },
});
