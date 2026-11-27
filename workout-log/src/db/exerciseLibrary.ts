/** Muscle groups, in the order the exercise picker lists them. */
export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type LibraryExercise = {
  /** Stable slug, referenced by the starter routines and stored in sets. */
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
};

/** The built-in exercises, inserted by the first migration. Custom ones are added by the user. */
export const exerciseLibrary: readonly LibraryExercise[] = [
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest' },
  { id: 'incline-bench-press', name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { id: 'dumbbell-press', name: 'Dumbbell Bench Press', muscleGroup: 'Chest' },
  { id: 'chest-fly', name: 'Chest Fly', muscleGroup: 'Chest' },
  { id: 'push-up', name: 'Push-Up', muscleGroup: 'Chest' },
  { id: 'dip', name: 'Dip', muscleGroup: 'Chest' },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'Back' },
  { id: 'pull-up', name: 'Pull-Up', muscleGroup: 'Back' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'Back' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', muscleGroup: 'Back' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'Back' },
  { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { id: 'biceps-curl', name: 'Biceps Curl', muscleGroup: 'Arms' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'Arms' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'Arms' },
  { id: 'triceps-pushdown', name: 'Triceps Pushdown', muscleGroup: 'Arms' },
  { id: 'skull-crusher', name: 'Skull Crusher', muscleGroup: 'Arms' },
  { id: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', muscleGroup: 'Arms' },
  { id: 'squat', name: 'Back Squat', muscleGroup: 'Legs' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'Legs' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs' },
  { id: 'lunge', name: 'Lunge', muscleGroup: 'Legs' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'Legs' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'Legs' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'Legs' },
  { id: 'calf-raise', name: 'Calf Raise', muscleGroup: 'Legs' },
  { id: 'plank', name: 'Plank', muscleGroup: 'Core' },
  { id: 'hanging-knee-raise', name: 'Hanging Knee Raise', muscleGroup: 'Core' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Core' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroup: 'Core' },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'Core' },
];
