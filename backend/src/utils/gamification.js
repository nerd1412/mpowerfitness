const { User, Notification } = require('../models/index');

const BADGES = {
  FIRST_WORKOUT: { name: 'First Step',     icon: '🏋️', description: 'Completed your very first workout!' },
  STREAK_7:      { name: 'Week Warrior',   icon: '🔥', description: 'Maintained a 7-day workout streak!' },
  STREAK_30:     { name: 'Iron Will',      icon: '⚡', description: '30-day streak — you\'re unstoppable!' },
  STREAK_100:    { name: 'Legend',         icon: '👑', description: '100-day streak! You are a legend.' },
  WORKOUTS_10:   { name: 'Getting Started',icon: '💪', description: 'Completed 10 workouts!' },
  WORKOUTS_50:   { name: 'Dedicated',      icon: '🎯', description: 'Completed 50 workouts!' },
  WORKOUTS_100:  { name: 'Century Club',   icon: '🏅', description: '100 workouts completed!' },
  CALORIES_10K:  { name: 'Calorie Crusher',icon: '🔥', description: 'Burned 10,000 total calories!' },
  CALORIES_50K:  { name: 'Inferno',        icon: '🌋', description: 'Burned 50,000 total calories!' },
  EARLY_BIRD:    { name: 'Early Bird',     icon: '🌅', description: 'Completed 5 morning workouts!' },
  BOOKED_FIRST:  { name: 'Team Player',   icon: '🤝', description: 'Booked your first trainer session!' },
};

const checkAndAwardBadges = async (io, userId, sessionData = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return [];

    const existingBadgeNames = (user.badges || []).map(b => b.name);
    const newBadges = [];

    const check = (condition, badge) => {
      if (condition && !existingBadgeNames.includes(badge.name)) newBadges.push(badge);
    };

    check(user.totalWorkouts === 1,   BADGES.FIRST_WORKOUT);
    check(user.totalWorkouts >= 10,   BADGES.WORKOUTS_10);
    check(user.totalWorkouts >= 50,   BADGES.WORKOUTS_50);
    check(user.totalWorkouts >= 100,  BADGES.WORKOUTS_100);
    check(user.streak >= 7,           BADGES.STREAK_7);
    check(user.streak >= 30,          BADGES.STREAK_30);
    check(user.streak >= 100,         BADGES.STREAK_100);
    check(user.totalCaloriesBurned >= 10000, BADGES.CALORIES_10K);
    check(user.totalCaloriesBurned >= 50000, BADGES.CALORIES_50K);

    if (newBadges.length > 0) {
      const updatedBadges = [
        ...(user.badges || []),
        ...newBadges.map(b => ({ ...b, earnedAt: new Date() }))
      ];
      await User.update(
        { badges: updatedBadges, points: (user.points || 0) + newBadges.length * 50 },
        { where: { id: userId } }
      );
      for (const badge of newBadges) {
        await Notification.create({
          recipientId: userId, recipientModel: 'User',
          title: `Badge Earned: ${badge.name}`,
          message: badge.description, type: 'achievement',
        }).catch(() => {});
        if (io) io.to(`user_${userId}`).emit('badge_earned', badge);
      }
    }
    return newBadges;
  } catch (err) {
    console.error('Badge check error:', err.message);
    return [];
  }
};

const updateStreak = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const lastW = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
    if (lastW) lastW.setHours(0, 0, 0, 0);
    let newStreak = user.streak || 0;
    if (!lastW)                                             newStreak = 1;
    else if (lastW.getTime() === yesterday.getTime())       newStreak = (user.streak || 0) + 1;
    else if (lastW.getTime() === today.getTime())           { /* same day */ }
    else                                                    newStreak = 1;
    await User.update(
      { streak: newStreak, lastWorkoutDate: new Date(), longestStreak: Math.max(user.longestStreak || 0, newStreak) },
      { where: { id: userId } }
    );
    return newStreak;
  } catch (err) {
    console.error('Streak update error:', err.message);
    return null;
  }
};

module.exports = { checkAndAwardBadges, updateStreak, BADGES };
