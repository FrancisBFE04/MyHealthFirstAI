-- ============================================================
-- MyHealthFirstAI Database Schema
-- SQLite/PostgreSQL Compatible
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    
    -- Profile
    age INTEGER,
    weight REAL,           -- kg
    height REAL,           -- cm
    gender VARCHAR(20),
    activity_level VARCHAR(50),
    
    -- Nutrition Targets
    target_calories INTEGER DEFAULT 2000,
    target_protein INTEGER DEFAULT 150,
    target_carbs INTEGER DEFAULT 250,
    target_fat INTEGER DEFAULT 65,
    target_water INTEGER DEFAULT 2500,   -- ml
    
    -- Workout Plan
    workout_plan VARCHAR(50) DEFAULT 'maintenance',
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'FREE',
    subscription_expires DATETIME,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);


-- Food Logs Table
CREATE TABLE IF NOT EXISTS food_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL,    -- breakfast, lunch, dinner, snack
    
    calories INTEGER NOT NULL,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    
    portion_size VARCHAR(100),
    image_url VARCHAR(500),
    
    -- AI Analysis
    ai_confidence REAL,
    source VARCHAR(50) DEFAULT 'manual',   -- manual, camera, voice
    
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_food_logs_user ON food_logs(user_id);
CREATE INDEX idx_food_logs_date ON food_logs(logged_at);


-- Water Logs Table
CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    amount_ml INTEGER NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_water_logs_user ON water_logs(user_id);


-- Daily Usage (Rate Limiting)
CREATE TABLE IF NOT EXISTS daily_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    
    ai_scans INTEGER DEFAULT 0,
    voice_logs INTEGER DEFAULT 0,
    form_checks INTEGER DEFAULT 0,
    coach_messages INTEGER DEFAULT 0,
    
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_daily_usage_user_date ON daily_usage(user_id, date);


-- User Badges (Gamification)
CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    badge_id VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description VARCHAR(255),
    badge_icon VARCHAR(50),
    
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_badges_user ON user_badges(user_id);


-- Streaks (Gamification)
CREATE TABLE IF NOT EXISTS streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    streak_type VARCHAR(50) NOT NULL,    -- logging, water, workout
    current_count INTEGER DEFAULT 0,
    best_count INTEGER DEFAULT 0,
    last_activity DATE,
    
    UNIQUE(user_id, streak_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_streaks_user ON streaks(user_id);


-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    target_type VARCHAR(50) NOT NULL,    -- water, protein, steps, etc.
    target_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50
);

CREATE INDEX idx_challenges_date ON daily_challenges(date);


-- User Challenge Completions
CREATE TABLE IF NOT EXISTS challenge_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    xp_earned INTEGER DEFAULT 0,
    
    UNIQUE(user_id, challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE
);


-- Meal Plans (Weekly Planning)
CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    calories INTEGER,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    
    recipe_id INTEGER,
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, date);


-- Saved Recipes
CREATE TABLE IF NOT EXISTS saved_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    ingredients TEXT NOT NULL,      -- JSON array
    instructions TEXT NOT NULL,     -- JSON array
    
    calories INTEGER,
    protein REAL,
    carbs REAL,
    fat REAL,
    
    prep_time INTEGER,              -- minutes
    difficulty VARCHAR(20),
    
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipes_user ON saved_recipes(user_id);


-- ============================================================
-- Sample Badge Definitions (for reference)
-- ============================================================
-- INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon) VALUES
-- (1, 'first_log', 'First Log', 'Logged your first meal', '🍽️'),
-- (1, 'week_streak', 'Week Warrior', '7-day logging streak', '🔥'),
-- (1, 'water_master', 'Hydration Hero', 'Hit water goal 5 days in a row', '💧'),
-- (1, 'protein_pro', 'Protein Pro', 'Hit protein goal 10 times', '💪'),
-- (1, 'early_bird', 'Early Bird', 'Logged breakfast before 8 AM', '🌅'),
-- (1, 'night_owl', 'Night Owl', 'Logged after 10 PM', '🦉'),
-- (1, 'recipe_chef', 'Recipe Chef', 'Generated 5 AI recipes', '👨‍🍳'),
-- (1, 'voice_logger', 'Voice Commander', 'Used voice logging 10 times', '🎤');


-- ============================================================
-- Sample Daily Challenges
-- ============================================================
-- INSERT INTO daily_challenges (date, title, description, target_type, target_value, xp_reward) VALUES
-- ('2024-01-15', 'Hydration Day', 'Drink 3 liters of water today', 'water', 3000, 100),
-- ('2024-01-16', 'Protein Power', 'Hit 150g of protein', 'protein', 150, 75),
-- ('2024-01-17', 'Veggie Day', 'Log 5 servings of vegetables', 'vegetables', 5, 50);
