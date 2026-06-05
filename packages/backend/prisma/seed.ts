import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding D-Chemistry database...\n");

  // ── Admin User ────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dchemistry.in" },
    update: {},
    create: {
      email: "admin@dchemistry.in",
      passwordHash: adminPassword,
      role: "ADMIN",
      profile: {
        create: {
          name: "Debajyoti Haldar",
          bio: "Founder & Chemistry Educator at D-Chemistry",
        },
      },
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ── Teacher User ──────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("teacher123456", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@dchemistry.in" },
    update: {},
    create: {
      email: "teacher@dchemistry.in",
      passwordHash: teacherPassword,
      role: "TEACHER",
      profile: {
        create: {
          name: "Demo Teacher",
        },
      },
    },
  });
  console.log(`✅ Teacher: ${teacher.email}`);

  // ── Student User ──────────────────────────────────────────
  const studentPassword = await bcrypt.hash("student123456", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@dchemistry.in" },
    update: {},
    create: {
      email: "student@dchemistry.in",
      passwordHash: studentPassword,
      role: "STUDENT",
      profile: {
        create: {
          name: "Demo Student",
          class: "CLASS_11",
          board: "JEE",
          language: "EN",
          streak: 5,
          lastActiveDate: new Date(),
        },
      },
      notificationPreference: {
        create: {},
      },
    },
  });
  console.log(`✅ Student: ${student.email}`);

  // ── Subjects ──────────────────────────────────────────────
  const physical = await prisma.subject.upsert({
    where: { slug: "physical-chemistry" },
    update: {},
    create: {
      name: "Physical Chemistry",
      slug: "physical-chemistry",
      description: "Study of macroscopic and atomic properties of matter, thermodynamics, kinetics, and quantum chemistry.",
      order: 0,
    },
  });

  const organic = await prisma.subject.upsert({
    where: { slug: "organic-chemistry" },
    update: {},
    create: {
      name: "Organic Chemistry",
      slug: "organic-chemistry",
      description: "Study of carbon-containing compounds, their structure, properties, reactions, and synthesis.",
      order: 1,
    },
  });

  const inorganic = await prisma.subject.upsert({
    where: { slug: "inorganic-chemistry" },
    update: {},
    create: {
      name: "Inorganic Chemistry",
      slug: "inorganic-chemistry",
      description: "Study of all chemical compounds except organic compounds, including metals, minerals, and coordination chemistry.",
      order: 2,
    },
  });
  console.log("✅ Subjects created");

  // ── Chapters ──────────────────────────────────────────────
  const chStoichiometry = await prisma.chapter.create({
    data: {
      subjectId: physical.id,
      name: "Some Basic Concepts of Chemistry",
      description: "Mole concept, stoichiometry, empirical and molecular formula",
      order: 0,
    },
  });

  const chAtomicStructure = await prisma.chapter.create({
    data: {
      subjectId: physical.id,
      name: "Structure of Atom",
      description: "Bohr model, quantum numbers, electron configuration, Hund's rule",
      order: 1,
    },
  });

  const chThermodynamics = await prisma.chapter.create({
    data: {
      subjectId: physical.id,
      name: "Thermodynamics",
      description: "First and second law, enthalpy, entropy, Gibbs free energy",
      order: 2,
    },
  });

  const chGOC = await prisma.chapter.create({
    data: {
      subjectId: organic.id,
      name: "General Organic Chemistry",
      description: "Nomenclature, isomerism, electronic effects, reaction intermediates",
      order: 0,
    },
  });

  const chHydrocarbons = await prisma.chapter.create({
    data: {
      subjectId: organic.id,
      name: "Hydrocarbons",
      description: "Alkanes, alkenes, alkynes, aromatic hydrocarbons",
      order: 1,
    },
  });

  const chPeriodicTable = await prisma.chapter.create({
    data: {
      subjectId: inorganic.id,
      name: "Periodic Table & Periodicity",
      description: "Modern periodic table, periodic trends, electronic configuration",
      order: 0,
    },
  });

  const chChemBonding = await prisma.chapter.create({
    data: {
      subjectId: inorganic.id,
      name: "Chemical Bonding & Molecular Structure",
      description: "Ionic, covalent, metallic bonding, VSEPR theory, hybridization",
      order: 1,
    },
  });
  console.log("✅ Chapters created");

  // ── Topics ────────────────────────────────────────────────
  const topicMoleConcept = await prisma.topic.create({
    data: { chapterId: chStoichiometry.id, name: "Mole Concept", order: 0 },
  });

  const topicStoichiometry = await prisma.topic.create({
    data: { chapterId: chStoichiometry.id, name: "Stoichiometry & Limiting Reagent", order: 1 },
  });

  const topicBohr = await prisma.topic.create({
    data: { chapterId: chAtomicStructure.id, name: "Bohr's Model", order: 0 },
  });

  const topicQuantumNumbers = await prisma.topic.create({
    data: { chapterId: chAtomicStructure.id, name: "Quantum Numbers", order: 1 },
  });

  const topicNomenclature = await prisma.topic.create({
    data: { chapterId: chGOC.id, name: "IUPAC Nomenclature", order: 0 },
  });

  const topicIsomerism = await prisma.topic.create({
    data: { chapterId: chGOC.id, name: "Isomerism", order: 1 },
  });

  const topicPeriodicTrends = await prisma.topic.create({
    data: { chapterId: chPeriodicTable.id, name: "Periodic Trends", order: 0 },
  });
  console.log("✅ Topics created");

  // ── Lessons ───────────────────────────────────────────────
  await prisma.lesson.createMany({
    data: [
      {
        topicId: topicMoleConcept.id,
        type: "VIDEO",
        title: "Introduction to Mole Concept",
        description: "Understanding Avogadro's number and the mole",
        duration: 2400,
        isFree: true,
        order: 0,
      },
      {
        topicId: topicMoleConcept.id,
        type: "PDF",
        title: "Mole Concept — Complete Notes",
        description: "Detailed notes with solved examples",
        isFree: true,
        order: 1,
      },
      {
        topicId: topicMoleConcept.id,
        type: "DPP",
        title: "Mole Concept — DPP 1",
        description: "Daily Practice Problems on mole concept",
        order: 2,
      },
      {
        topicId: topicBohr.id,
        type: "VIDEO",
        title: "Bohr's Model — Complete Theory",
        description: "Energy levels, line spectra, limitations of Bohr model",
        duration: 3600,
        isFree: true,
        order: 0,
      },
      {
        topicId: topicNomenclature.id,
        type: "VIDEO",
        title: "IUPAC Nomenclature — Part 1",
        description: "Rules for naming organic compounds",
        duration: 2700,
        order: 0,
      },
      {
        topicId: topicPeriodicTrends.id,
        type: "ARTICLE",
        title: "Periodic Trends — Quick Revision",
        description: "Ionization energy, electron affinity, electronegativity trends",
        content: "<h2>Periodic Trends</h2><p>Key trends across periods and groups...</p>",
        isFree: true,
        order: 0,
      },
    ],
  });
  console.log("✅ Lessons created");

  // ── Questions ─────────────────────────────────────────────
  await prisma.question.createMany({
    data: [
      {
        topicId: topicMoleConcept.id,
        text: "How many atoms are present in 1 mole of hydrogen gas (H₂)?",
        options: JSON.parse(JSON.stringify([
          { index: 0, text: "6.022 × 10²³" },
          { index: 1, text: "12.044 × 10²³" },
          { index: 2, text: "3.011 × 10²³" },
          { index: 3, text: "18.066 × 10²³" },
        ])),
        correctIndex: 1,
        explanation: "1 mole of H₂ contains 6.022 × 10²³ molecules. Each molecule has 2 atoms. So total atoms = 2 × 6.022 × 10²³ = 12.044 × 10²³",
        difficulty: "EASY",
        type: "MCQ",
        examType: "JEE_MAIN",
      },
      {
        topicId: topicMoleConcept.id,
        text: "The number of moles of oxygen atoms in 1 mole of Na₂CO₃ is:",
        options: JSON.parse(JSON.stringify([
          { index: 0, text: "1" },
          { index: 1, text: "2" },
          { index: 2, text: "3" },
          { index: 3, text: "6" },
        ])),
        correctIndex: 2,
        explanation: "Na₂CO₃ has 3 oxygen atoms per formula unit. 1 mole of Na₂CO₃ contains 3 moles of oxygen atoms.",
        difficulty: "EASY",
        type: "MCQ",
        examType: "NEET",
      },
      {
        topicId: topicBohr.id,
        text: "The radius of the nth orbit in Bohr's model is proportional to:",
        options: JSON.parse(JSON.stringify([
          { index: 0, text: "n" },
          { index: 1, text: "n²" },
          { index: 2, text: "1/n" },
          { index: 3, text: "1/n²" },
        ])),
        correctIndex: 1,
        explanation: "In Bohr's model, rₙ = 0.529 × n²/Z Å. The radius is directly proportional to n².",
        difficulty: "MEDIUM",
        type: "MCQ",
        examType: "JEE_MAIN",
        pyqYear: 2023,
      },
      {
        topicId: topicNomenclature.id,
        text: "The IUPAC name of CH₃-CH(OH)-CH₃ is:",
        options: JSON.parse(JSON.stringify([
          { index: 0, text: "Propan-1-ol" },
          { index: 1, text: "Propan-2-ol" },
          { index: 2, text: "Isopropyl alcohol" },
          { index: 3, text: "2-Methylethanol" },
        ])),
        correctIndex: 1,
        explanation: "The -OH group is on carbon 2. IUPAC name: propan-2-ol. 'Isopropyl alcohol' is the common name.",
        difficulty: "EASY",
        type: "MCQ",
        examType: "NEET",
      },
      {
        topicId: topicPeriodicTrends.id,
        text: "Which has the highest ionization energy?",
        options: JSON.parse(JSON.stringify([
          { index: 0, text: "Na" },
          { index: 1, text: "Mg" },
          { index: 2, text: "Al" },
          { index: 3, text: "Si" },
        ])),
        correctIndex: 1,
        explanation: "Mg has the highest first IE in this set due to its fully filled 3s² configuration, which provides extra stability.",
        difficulty: "MEDIUM",
        type: "MCQ",
        examType: "JEE_MAIN",
      },
    ],
  });
  console.log("✅ Questions created");

  // ── Flashcards ────────────────────────────────────────────
  await prisma.flashCard.createMany({
    data: [
      {
        topicId: topicPeriodicTrends.id,
        front: "What is the trend of ionization energy across a period?",
        back: "Ionization energy generally INCREASES across a period (left → right) due to increasing nuclear charge with same shielding.",
        category: "PERIODIC_TREND",
        order: 0,
      },
      {
        topicId: topicPeriodicTrends.id,
        front: "What is the trend of atomic radius down a group?",
        back: "Atomic radius INCREASES down a group due to addition of new electron shells.",
        category: "PERIODIC_TREND",
        order: 1,
      },
      {
        topicId: topicMoleConcept.id,
        front: "What is Avogadro's Number?",
        back: "Nₐ = 6.022 × 10²³ mol⁻¹\nIt is the number of entities (atoms, molecules, ions) in 1 mole of any substance.",
        category: "FORMULA",
        order: 0,
      },
    ],
  });
  console.log("✅ Flashcards created");

  // ── Batch ─────────────────────────────────────────────────
  const batch = await prisma.batch.create({
    data: {
      name: "Class 11 JEE 2027 — Chemistry",
      description: "Complete JEE chemistry preparation batch for Class 11 students",
      class: "CLASS_11",
      board: "JEE",
      isFree: true,
      inviteCode: "DCHEM2027",
      subjects: {
        create: [
          { subjectId: physical.id },
          { subjectId: organic.id },
          { subjectId: inorganic.id },
        ],
      },
    },
  });

  // Enroll demo student
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      batchId: batch.id,
      status: "ACTIVE",
    },
  });
  console.log("✅ Batch created & student enrolled");

  // ── Live Class ────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);

  await prisma.liveClass.create({
    data: {
      title: "Mole Concept — Live Doubt Session",
      description: "Clear all your doubts on mole concept and stoichiometry",
      batchId: batch.id,
      scheduledAt: tomorrow,
      duration: 60,
      meetLink: "https://meet.google.com/abc-defg-hij",
    },
  });
  console.log("✅ Live class scheduled");

  console.log("\n🎉 Seeding complete!\n");
  console.log("  Admin:   admin@dchemistry.in / admin123456");
  console.log("  Teacher: teacher@dchemistry.in / teacher123456");
  console.log("  Student: student@dchemistry.in / student123456");
  console.log("  Batch invite code: DCHEM2027");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
