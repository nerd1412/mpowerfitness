const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { Admin, Workout, Program, NutritionPlan, CommunityGroup } = require('../models/index');

/* ─── Helper ──────────────────────────────────────────────────── */
const exists = async (Model, where) => !!(await Model.findOne({ where }));

/* ─── Seed ────────────────────────────────────────────────────── */
const seed = async () => {
  console.log('🌱 Seeding Mpower Fitness database…');

  /* ── 1. Admin account ─────────────────────────────────────── */
  let admin = await Admin.findOne({ where: { email: 'admin@mpowerfitness.com' } });
  if (!admin) {
    admin = await Admin.create({
      name: 'Mpower Admin',
      email: 'admin@mpowerfitness.com',
      password: await bcrypt.hash('Admin@123456', 12),
      role: 'superadmin',
      isActive: true,
      upiId: process.env.UPI_ID || 'payments@mpowerfitness',
      upiName: process.env.UPI_NAME || 'Mpower Fitness',
      permissions: ['all'],
    });
    console.log('✅ Admin seeded  →  admin@mpowerfitness.com / Admin@123456');
  } else {
    console.log('✅ Admin already exists, skipping');
  }

  const adminId = admin.id || admin._id;

  /* ── 2. Sample workouts ──────────────────────────────────── */
  if (!(await exists(Workout, { title: 'Full-Body Strength Foundation' }))) {
    await Workout.create({
      title: 'Full-Body Strength Foundation',
      description: 'A science-backed compound movement programme targeting all major muscle groups. Based on progressive overload principles (ACSM guidelines), this 3×/week routine builds functional strength and lean mass simultaneously.',
      category: 'strength',
      difficulty: 'beginner',
      duration: 50,
      caloriesBurn: 320,
      isFeatured: true,
      isActive: true,
      createdBy: adminId,
      creatorModel: 'Admin',
      tags: ['compound', 'full-body', 'progressive-overload', 'beginner-friendly', 'ACSM'],
      equipment: ['barbell', 'dumbbells', 'bench', 'pull-up-bar'],
      exercises: [
        { name: 'Bodyweight Squat (warm-up)', sets: 2, reps: 15, restTime: 30,
          instructions: 'Feet shoulder-width, chest up, drive knees out. Activates glutes before loaded work.',
          muscleGroups: ['quadriceps', 'glutes'] },
        { name: 'Goblet Squat', sets: 3, reps: 12, restTime: 60,
          instructions: 'Hold dumbbell at chest, sit back into squat. Promotes ankle mobility and upright torso.',
          muscleGroups: ['quadriceps', 'glutes', 'core'] },
        { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: 10, restTime: 90,
          instructions: 'Hinge at hips with soft knees, push hips back. Research shows superior hamstring EMG vs leg curl.',
          muscleGroups: ['hamstrings', 'glutes', 'lower_back'] },
        { name: 'Push-Up', sets: 3, reps: 12, restTime: 60,
          instructions: 'Elbows at 45°, full ROM. RCT data: compound push patterns increase shoulder stability.',
          muscleGroups: ['chest', 'triceps', 'anterior_deltoid'] },
        { name: 'Dumbbell Bent-Over Row', sets: 3, reps: 10, restTime: 60,
          instructions: 'Retract scapula at top. Balances push:pull ratio, reducing injury risk.',
          muscleGroups: ['latissimus_dorsi', 'rhomboids', 'biceps'] },
        { name: 'Plank', sets: 3, duration: 30, restTime: 45,
          instructions: 'Neutral spine, brace abs. McGill Big-3 approved for spinal stability.',
          muscleGroups: ['core', 'transverse_abdominis'] },
      ],
    });
    console.log('✅ Workout 1 seeded — Full-Body Strength Foundation');
  }

  if (!(await exists(Workout, { title: 'HIIT Metabolic Blast' }))) {
    await Workout.create({
      title: 'HIIT Metabolic Blast',
      description: 'High-Intensity Interval Training protocol backed by Tabata (1996) and Gibala (2008) research. 20s max effort : 10s rest cycles elevate EPOC (Excess Post-exercise Oxygen Consumption) for up to 24hr post-session fat burn.',
      category: 'hiit',
      difficulty: 'intermediate',
      duration: 25,
      caloriesBurn: 280,
      isFeatured: true,
      isActive: true,
      createdBy: adminId,
      creatorModel: 'Admin',
      tags: ['HIIT', 'fat-loss', 'EPOC', 'Tabata', 'cardio', 'no-equipment'],
      equipment: ['mat'],
      exercises: [
        { name: 'Jump Squat', sets: 4, duration: 20, restTime: 10,
          instructions: 'Explosive upward drive, soft landing. Plyometric training boosts power output (NSCA, 2016).',
          muscleGroups: ['quadriceps', 'glutes', 'calves'] },
        { name: 'Push-Up to T-Rotation', sets: 4, duration: 20, restTime: 10,
          instructions: 'Alternate thoracic rotation each rep. Multi-planar movement increases caloric demand by ~18%.',
          muscleGroups: ['chest', 'core', 'obliques'] },
        { name: 'Mountain Climbers', sets: 4, duration: 20, restTime: 10,
          instructions: 'Drive knees to chest alternately at speed. Elevates HR to 85–95% max (zone 4–5).',
          muscleGroups: ['core', 'hip_flexors', 'quadriceps'] },
        { name: 'Burpee', sets: 4, duration: 20, restTime: 10,
          instructions: 'Full extension at top. Burns ~10 kcal/min — highest of any bodyweight exercise (ACE, 2013).',
          muscleGroups: ['full_body'] },
        { name: 'High Knees', sets: 4, duration: 20, restTime: 10,
          instructions: 'Drive knees to hip height. Active recovery between rounds keeps HR elevated.',
          muscleGroups: ['hip_flexors', 'quadriceps', 'calves'] },
        { name: 'Lateral Lunge', sets: 4, duration: 20, restTime: 10,
          instructions: 'Step wide, sit into lunge, push back. Targets adductors and glute medius — often neglected.',
          muscleGroups: ['glutes', 'adductors', 'quadriceps'] },
      ],
    });
    console.log('✅ Workout 2 seeded — HIIT Metabolic Blast');
  }

  /* ── 3. Sample program ───────────────────────────────────── */
  if (!(await exists(Program, { title: '8-Week Body Recomposition' }))) {
    await Program.create({
      title: '8-Week Body Recomposition',
      description: 'Evidence-based 8-week simultaneous fat-loss and muscle-gain programme. Combines resistance training (3×/week) with moderate cardio (2×/week) and caloric cycling. Based on Barakat et al. (2020) meta-analysis showing recomposition is achievable for trained individuals in a controlled caloric range (±200–300 kcal maintenance).',
      category: 'recomposition',
      difficulty: 'intermediate',
      duration: 8,
      price: 2999,
      isPaid: true,
      isActive: true,
      isFeatured: true,
      tags: ['recomposition', 'fat-loss', 'muscle-gain', 'evidence-based', '8-week'],
      features: [
        '3 strength sessions + 2 HIIT sessions per week',
        'Progressive overload tracker with weekly milestones',
        'Science-backed caloric cycling protocol',
        'Video exercise library with form cues',
        'Weekly check-in and adjustment protocol',
        'Nutrition guidance with macro targets',
      ],
      workoutPlan: {
        week1_2: 'Foundation — establish movement patterns, 60–70% 1RM',
        week3_4: 'Hypertrophy — 3–4 sets × 8–12 reps, increase load 5%',
        week5_6: 'Strength — 4–5 sets × 4–6 reps, 80–85% 1RM',
        week7_8: 'Peak & Deload — peak week testing + 50% volume deload',
      },
    });
    console.log('✅ Program seeded — 8-Week Body Recomposition');
  }

  /* ── 4. Sample nutrition plan ────────────────────────────── */
  const SEED_MEALS = [
    { name:'Breakfast', time:'07:30', items:[
      { name:'Oats with milk & banana', quantity:'60g oats + 200ml milk + 1 banana', calories:380, protein:14, carbs:68, fat:6 },
      { name:'Boiled eggs or paneer', quantity:'2 eggs OR 80g paneer', calories:160, protein:14, carbs:2, fat:10 },
      { name:'Green tea', quantity:'1 cup unsweetened', calories:2, protein:0, carbs:0, fat:0 },
    ]},
    { name:'Mid-Morning Snack', time:'10:30', items:[
      { name:'Mixed nuts', quantity:'30g almonds + walnuts', calories:185, protein:5, carbs:6, fat:16 },
      { name:'Seasonal fruit', quantity:'1 medium apple / guava / pear', calories:80, protein:1, carbs:20, fat:0 },
    ]},
    { name:'Lunch', time:'13:00', items:[
      { name:'Dal (moong/masoor/chana)', quantity:'1 katori (150g cooked)', calories:145, protein:10, carbs:22, fat:2 },
      { name:'Mixed sabzi', quantity:'200g cooked vegetables', calories:90, protein:4, carbs:14, fat:2 },
      { name:'Chapati / brown rice', quantity:'2 medium roti OR 120g cooked brown rice', calories:200, protein:6, carbs:40, fat:2 },
      { name:'Curd / raita', quantity:'150g low-fat curd', calories:90, protein:7, carbs:8, fat:2 },
    ]},
    { name:'Pre-Workout Snack', time:'16:30', items:[
      { name:'Banana + peanut butter', quantity:'1 large banana + 1 tbsp PB', calories:230, protein:5, carbs:38, fat:8 },
    ]},
    { name:'Dinner', time:'19:30', items:[
      { name:'Grilled chicken / paneer / tofu', quantity:'150g lean protein', calories:220, protein:35, carbs:3, fat:7 },
      { name:'Sautéed vegetables', quantity:'200g mixed (broccoli, beans, capsicum)', calories:70, protein:4, carbs:10, fat:1 },
      { name:'Chapati', quantity:'2 medium roti', calories:160, protein:5, carbs:32, fat:2 },
    ]},
  ];
  const seedPlan = await NutritionPlan.findOne({ where: { title: 'Balanced Macro Blueprint' } });
  if (!seedPlan) {
    await NutritionPlan.create({
      title: 'Balanced Macro Blueprint',
      description: 'Flexible macro-based eating plan grounded in ICMR dietary guidelines. Emphasises dal, sabzi, roti, rice, curd and regional whole foods with precision macro targets.',
      goal: 'maintenance',
      caloriesPerDay: 2200,
      proteinGrams: 160,
      carbsGrams: 260,
      fatGrams: 65,
      isPublic: true,
      tags: ['balanced', 'Indian-foods', 'ICMR', 'macros', 'flexible', 'vegetarian-friendly'],
      meals: SEED_MEALS,
    });
    console.log('✅ Nutrition plan seeded — Balanced Macro Blueprint');
  } else if (!seedPlan.caloriesPerDay || seedPlan.caloriesPerDay === 0) {
    // Fix legacy seeded data that used wrong field names
    const fixedMeals = (seedPlan.meals || []).map(m => ({
      name: m.name, time: m.time,
      items: (m.items && m.items.length ? m.items : m.foods) || [],
    })).filter(m => m.name);
    await seedPlan.update({
      caloriesPerDay: 2200, proteinGrams: 160, carbsGrams: 260, fatGrams: 65,
      isPublic: true,
      meals: fixedMeals.length ? fixedMeals : SEED_MEALS,
    });
    console.log('✅ Fixed nutrition plan field names');
  }

  /* ── 5. Community groups ─────────────────────────────── */
  const GROUPS = [
    { name:'PCOD & Hormonal Health', slug:'pcod-hormonal-health', condition:'pcod',
      icon:'🌸', color:'#FF6B9D', isFeatured:true,
      description:'A safe space for women managing PCOD, PCOS and hormonal imbalances. Share your fitness wins, nutrition tips and emotional journey. Evidence-based guidance on low-GI eating, strength training for insulin sensitivity, and stress management.',
      rules:['Be kind and supportive — health journeys are personal','Share personal experiences, not medical prescriptions','Tag posts with your condition type for easy filtering'] },
    { name:'Diabetes & Metabolic Health', slug:'diabetes-metabolic', condition:'diabetes',
      icon:'💉', color:'#4E9FFF', isFeatured:true,
      description:'Fitness and nutrition support for people with Type 1, Type 2 diabetes and insulin resistance. Backed by ADA (American Diabetes Association) guidelines — resistance training improves HbA1c, walking after meals reduces glucose spikes.',
      rules:['Always consult your doctor before changing medication','Share blood sugar logs to inspire and be inspired','Post-meal walks are everyone\'s friend here'] },
    { name:'Thyroid Warriors', slug:'thyroid-warriors', condition:'thyroid',
      icon:'🦋', color:'#A78BFA', isFeatured:true,
      description:'Hypothyroid, hyperthyroid, Hashimoto\'s — this group gets it. Slow metabolism, fatigue, brain fog. Science shows selenium-rich foods, iodine management and moderate-intensity training can support thyroid function.',
      rules:['Share lab values with context, not alarm','Celebrate small wins — energy levels count!','Tag posts #hypo or #hyper for clarity'] },
    { name:'Joint Pain & Mobility', slug:'joint-pain-mobility', condition:'joint_pain',
      icon:'🦴', color:'#22D97A', isFeatured:false,
      description:'For people managing osteoarthritis, rheumatoid arthritis, knee/hip issues. Low-impact doesn\'t mean low results. Water aerobics, resistance bands, chair yoga — all valid. EULAR guidelines support exercise as first-line joint treatment.',
      rules:['No pain, no gain is a myth here — comfort is progress','Share modifications that worked for you','Consult physio before trying new exercises'] },
    { name:'Hypertension & Heart Health', slug:'hypertension-heart', condition:'hypertension',
      icon:'❤️', color:'#FF4D4D', isFeatured:false,
      description:'Managing blood pressure through movement and nutrition. DASH diet, Zone 2 cardio (50–60% max HR), and breathing exercises (Bhramari pranayama) are clinically proven to reduce systolic BP by 5–10 mmHg.',
      rules:['Always know your resting BP before intense workouts','Share your "green zone" workout routines','Sodium counts — share low-sodium Indian recipes'] },
    { name:'Weight Loss Together', slug:'weight-loss-together', condition:'weight_loss',
      icon:'🔥', color:'#FF5F1F', isFeatured:true,
      description:'For anyone on a fat-loss journey. Evidence-based: 500 kcal deficit/day, protein at 1.6g/kg bodyweight, progressive resistance training, 7–9 hrs sleep. This isn\'t a crash diet group — it\'s a lifestyle group.',
      rules:['No crash diets or extreme deficit talk','Celebrate non-scale victories (energy, clothes, strength)','Weekly check-ins keep us accountable'] },
    { name:'Beginners & Getting Started', slug:'beginners-getting-started', condition:'general',
      icon:'🌱', color:'#C8F135', isFeatured:true,
      description:'New to fitness? This is where everyone starts. No judgement. Ask anything. The best workout is the one you actually do. Research shows social support is one of the strongest predictors of exercise adherence (ACSM, 2020).',
      rules:['There are no stupid questions','Share your Day 1 — it inspires others','Consistency > perfection, every time'] },
  ];
  for (const g of GROUPS) {
    if (!(await exists(CommunityGroup, { slug: g.slug }))) {
      await CommunityGroup.create(g);
      console.log(`✅ Community group seeded — ${g.name}`);
    }
  }

  console.log('\n🚀 Seeding complete!\n');
};

module.exports = { seed };

if (require.main === module) {
  const { sequelize } = require('../models/index');
  sequelize.sync({ alter: true })
    .then(() => seed())
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
}
