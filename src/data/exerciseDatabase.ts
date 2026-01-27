// Common exercises database for autocomplete suggestions
export interface ExerciseItem {
  name: string;
  muscleGroup: string;
}

export const EXERCISE_DATABASE: ExerciseItem[] = [
  // Chest
  { name: "Bench Press", muscleGroup: "Chest" },
  { name: "Incline Bench Press", muscleGroup: "Chest" },
  { name: "Decline Bench Press", muscleGroup: "Chest" },
  { name: "Dumbbell Bench Press", muscleGroup: "Chest" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { name: "Dumbbell Flyes", muscleGroup: "Chest" },
  { name: "Cable Flyes", muscleGroup: "Chest" },
  { name: "Push-ups", muscleGroup: "Chest" },
  { name: "Chest Dips", muscleGroup: "Chest" },
  { name: "Pec Deck", muscleGroup: "Chest" },
  { name: "Machine Chest Press", muscleGroup: "Chest" },

  // Back
  { name: "Deadlift", muscleGroup: "Back" },
  { name: "Pull-ups", muscleGroup: "Back" },
  { name: "Chin-ups", muscleGroup: "Back" },
  { name: "Lat Pulldown", muscleGroup: "Back" },
  { name: "Bent Over Row", muscleGroup: "Back" },
  { name: "Dumbbell Row", muscleGroup: "Back" },
  { name: "Cable Row", muscleGroup: "Back" },
  { name: "Seated Cable Row", muscleGroup: "Back" },
  { name: "T-Bar Row", muscleGroup: "Back" },
  { name: "Face Pulls", muscleGroup: "Back" },
  { name: "Straight Arm Pulldown", muscleGroup: "Back" },
  { name: "Hyperextensions", muscleGroup: "Back" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders" },
  { name: "Military Press", muscleGroup: "Shoulders" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders" },
  { name: "Arnold Press", muscleGroup: "Shoulders" },
  { name: "Lateral Raises", muscleGroup: "Shoulders" },
  { name: "Front Raises", muscleGroup: "Shoulders" },
  { name: "Rear Delt Flyes", muscleGroup: "Shoulders" },
  { name: "Upright Row", muscleGroup: "Shoulders" },
  { name: "Shrugs", muscleGroup: "Shoulders" },
  { name: "Cable Lateral Raises", muscleGroup: "Shoulders" },

  // Biceps
  { name: "Barbell Curl", muscleGroup: "Biceps" },
  { name: "Dumbbell Curl", muscleGroup: "Biceps" },
  { name: "Hammer Curl", muscleGroup: "Biceps" },
  { name: "Preacher Curl", muscleGroup: "Biceps" },
  { name: "Concentration Curl", muscleGroup: "Biceps" },
  { name: "Cable Curl", muscleGroup: "Biceps" },
  { name: "Incline Dumbbell Curl", muscleGroup: "Biceps" },
  { name: "EZ Bar Curl", muscleGroup: "Biceps" },
  { name: "Spider Curl", muscleGroup: "Biceps" },

  // Triceps
  { name: "Tricep Pushdown", muscleGroup: "Triceps" },
  { name: "Rope Pushdown", muscleGroup: "Triceps" },
  { name: "Skull Crushers", muscleGroup: "Triceps" },
  { name: "Close Grip Bench Press", muscleGroup: "Triceps" },
  { name: "Overhead Tricep Extension", muscleGroup: "Triceps" },
  { name: "Dumbbell Tricep Extension", muscleGroup: "Triceps" },
  { name: "Tricep Dips", muscleGroup: "Triceps" },
  { name: "Diamond Push-ups", muscleGroup: "Triceps" },
  { name: "Kickbacks", muscleGroup: "Triceps" },

  // Legs
  { name: "Squat", muscleGroup: "Legs" },
  { name: "Front Squat", muscleGroup: "Legs" },
  { name: "Leg Press", muscleGroup: "Legs" },
  { name: "Lunges", muscleGroup: "Legs" },
  { name: "Walking Lunges", muscleGroup: "Legs" },
  { name: "Bulgarian Split Squat", muscleGroup: "Legs" },
  { name: "Leg Extension", muscleGroup: "Legs" },
  { name: "Leg Curl", muscleGroup: "Legs" },
  { name: "Romanian Deadlift", muscleGroup: "Legs" },
  { name: "Calf Raises", muscleGroup: "Legs" },
  { name: "Seated Calf Raises", muscleGroup: "Legs" },
  { name: "Goblet Squat", muscleGroup: "Legs" },
  { name: "Hack Squat", muscleGroup: "Legs" },
  { name: "Step Ups", muscleGroup: "Legs" },

  // Glutes
  { name: "Hip Thrust", muscleGroup: "Glutes" },
  { name: "Glute Bridge", muscleGroup: "Glutes" },
  { name: "Cable Kickbacks", muscleGroup: "Glutes" },
  { name: "Sumo Deadlift", muscleGroup: "Glutes" },
  { name: "Sumo Squat", muscleGroup: "Glutes" },
  { name: "Donkey Kicks", muscleGroup: "Glutes" },
  { name: "Fire Hydrants", muscleGroup: "Glutes" },
  { name: "Glute Kickback Machine", muscleGroup: "Glutes" },

  // Core
  { name: "Plank", muscleGroup: "Core" },
  { name: "Crunches", muscleGroup: "Core" },
  { name: "Sit-ups", muscleGroup: "Core" },
  { name: "Leg Raises", muscleGroup: "Core" },
  { name: "Hanging Leg Raises", muscleGroup: "Core" },
  { name: "Russian Twists", muscleGroup: "Core" },
  { name: "Ab Wheel Rollout", muscleGroup: "Core" },
  { name: "Cable Crunch", muscleGroup: "Core" },
  { name: "Mountain Climbers", muscleGroup: "Core" },
  { name: "Dead Bug", muscleGroup: "Core" },
  { name: "Bird Dog", muscleGroup: "Core" },
  { name: "Side Plank", muscleGroup: "Core" },

  // Cardio
  { name: "Treadmill", muscleGroup: "Cardio" },
  { name: "Cycling", muscleGroup: "Cardio" },
  { name: "Rowing Machine", muscleGroup: "Cardio" },
  { name: "Stair Climber", muscleGroup: "Cardio" },
  { name: "Elliptical", muscleGroup: "Cardio" },
  { name: "Jump Rope", muscleGroup: "Cardio" },
  { name: "Burpees", muscleGroup: "Cardio" },
  { name: "Box Jumps", muscleGroup: "Cardio" },
  { name: "Battle Ropes", muscleGroup: "Cardio" },
  { name: "HIIT", muscleGroup: "Cardio" },

  // Full Body
  { name: "Clean and Jerk", muscleGroup: "Full Body" },
  { name: "Snatch", muscleGroup: "Full Body" },
  { name: "Thrusters", muscleGroup: "Full Body" },
  { name: "Kettlebell Swings", muscleGroup: "Full Body" },
  { name: "Turkish Get Up", muscleGroup: "Full Body" },
  { name: "Farmers Walk", muscleGroup: "Full Body" },
  { name: "Man Makers", muscleGroup: "Full Body" },
];

export function searchExercises(query: string, limit: number = 8): ExerciseItem[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return EXERCISE_DATABASE
    .filter(exercise => exercise.name.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}
