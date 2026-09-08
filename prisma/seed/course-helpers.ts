import { CourseLevel, LessonType, Prisma } from "@prisma/client";

export interface QuizQuestionSeed {
  text: string;
  explanation?: string;
  options: { text: string; isCorrect: boolean }[];
}

export function articleBody(
  title: string,
  paragraphs: string[]
): string {
  return `# ${title}\n\n${paragraphs.join("\n\n")}`;
}

export function quizLesson(
  title: string,
  slug: string,
  orderIndex: number,
  questions: QuizQuestionSeed[]
): Prisma.LessonCreateWithoutModuleInput {
  return {
    title,
    slug,
    type: "QUIZ" as LessonType,
    orderIndex,
    quiz: {
      create: {
        passMark: 70,
        timeLimit: 15,
        questions: {
          create: questions.map((q, qi) => ({
            text: q.text,
            explanation: q.explanation,
            orderIndex: qi,
            options: {
              create: q.options.map((o, oi) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                orderIndex: oi,
              })),
            },
          })),
        },
      },
    },
  };
}

export function assignmentLesson(
  title: string,
  slug: string,
  orderIndex: number,
  instructions: string,
  maxScore = 100
): Prisma.LessonCreateWithoutModuleInput {
  return {
    title,
    slug,
    type: "ASSIGNMENT" as LessonType,
    orderIndex,
    assignment: {
      create: {
        instructions,
        maxScore,
        rubric: {
          criteria: [
            { name: "Technical accuracy", weight: 40 },
            { name: "African context relevance", weight: 30 },
            { name: "Documentation quality", weight: 30 },
          ],
        },
      },
    },
  };
}

export function videoLesson(
  title: string,
  slug: string,
  orderIndex: number,
  videoUrl: string,
  durationSeconds: number,
  isFreePreview = false
): Prisma.LessonCreateWithoutModuleInput {
  return {
    title,
    slug,
    type: "VIDEO" as LessonType,
    videoUrl,
    durationSeconds,
    isFreePreview,
    orderIndex,
  };
}

export function articleLesson(
  title: string,
  slug: string,
  orderIndex: number,
  body: string,
  isFreePreview = false
): Prisma.LessonCreateWithoutModuleInput {
  return {
    title,
    slug,
    type: "ARTICLE" as LessonType,
    articleBody: body,
    orderIndex,
    isFreePreview,
  };
}

export interface CourseSeedConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  level: CourseLevel;
  durationHours: number;
  whatYouLearn: string[];
  prerequisites: string;
  targetAudience: string;
  linkedKitSlugs?: string[];
  enableCert?: boolean;
  certificateTemplatePath?: string;
  isFree?: boolean;
  price?: number;
  modules: Prisma.CourseModuleCreateWithoutCourseInput[];
}

export function buildCourse(
  instructorId: string,
  config: CourseSeedConfig
): Prisma.CourseCreateInput {
  const {
    certificateTemplatePath,
    enableCert = true,
    linkedKitSlugs,
    modules,
    ...rest
  } = config;

  return {
    ...rest,
    instructor: { connect: { id: instructorId } },
    status: "PUBLISHED",
    language: "English",
    isFree: config.isFree ?? true,
    price: config.price ?? 0,
    enableCert,
    whatYouLearn: config.whatYouLearn,
    linkedKitSlugs: linkedKitSlugs ?? [],
    modules: { create: modules },
    ...(certificateTemplatePath
      ? {
          certTemplate: {
            create: { filePath: certificateTemplatePath },
          },
        }
      : {}),
  };
}

// ─── Shared article content (300+ words, African STEM context) ───────────────

export const ARTICLES = {
  arduinoIntro: articleBody("Arduino for African Makers", [
    "Arduino has become the gateway microcontroller for millions of young innovators across East Africa. From Dar es Salaam to Kigali, school labs and community hubs use the Arduino Uno because it is affordable, well-documented, and supported by a global open-source ecosystem. Unlike proprietary boards that lock learners into single vendors, Arduino encourages experimentation with sensors, motors, and communication modules that address real local challenges.",
    "In Tanzanian secondary schools participating in the TechStar UjuziLab programme, students begin with the classic blink exercise—not as a toy demo, but as a lesson in digital output, current limiting resistors, and safe breadboard wiring. Teachers emphasise voltage levels compatible with East African power conditions, including unstable mains supply and the need for USB battery packs during load-shedding.",
    "African makers quickly move beyond LEDs. Robotics clubs in Nairobi prototype line-following robots for science fairs. In rural Uganda, moisture-sensing sketches inform irrigation timing for school gardens. The Arduino IDE runs on modest laptops common in public labs, and offline library bundles help when campus Wi-Fi is intermittent.",
    "UjuziLab aligns Arduino robotics courses with the classroom kit inventory that partner organisations manage through the platform. Learners who complete module assessments receive certificates tied to verifiable course completion—credentials that matter when applying for innovation grants or university engineering programmes.",
    "As you progress through this course, document every prototype with photos and schematic notes. African innovation ecosystems value builders who can explain their design choices to community stakeholders, not only to fellow engineers.",
  ]),

  motorControl: articleBody("Motor Control for Line-Following Robots", [
    "Driving DC motors from an Arduino requires more current than a GPIO pin can safely deliver. In UjuziLab robotics workshops across Kenya and Tanzania, students learn to interface L298N or TB6612 motor driver modules that accept PWM speed signals while protecting the microcontroller from back-EMF spikes common when motors decelerate.",
    "Line-following robots remain a staple capstone project because they combine mechanical assembly, sensor placement, and control logic. African competition tracks often use black tape on concrete or tiled floors found in school corridors—surfaces quite different from polished lab tables in Western tutorials. Calibration routines must account for ambient light from open windows and inconsistent tape contrast.",
    "A typical differential-drive chassis uses two geared motors with encoders optional at beginner level. Students mount IR reflective sensors in a row of three or five, reading analogue or digital values to estimate position relative to the line. PID control is introduced gradually: proportional steering first, then integral and derivative terms once baseline following works.",
    "Power budgeting matters when robots run from 18650 packs or 7.4 V LiPo cells sourced locally. Teams learn to separate motor supply rails from logic power when brownouts cause erratic sensor reads. Safety briefings cover battery charging in humid coastal climates and proper disposal of damaged cells.",
    "Your assignment will ask you to tune a line follower for a school corridor course. Record motor PWM values, sensor thresholds, and failure modes such as sharp corners or crossed lines. These field notes mirror how African hardware startups iterate in resource-constrained environments.",
  ]),

  iotAgriOverview: articleBody("IoT Smart Agriculture in East Africa", [
    "Smallholder farmers produce most of East Africa's food yet often lack timely data on soil moisture, microclimate, and crop stress. Internet of Things (IoT) toolkits—combining low-cost sensors, microcontrollers, and occasional LoRa or GSM backhaul—let student innovators and agritech startups prototype monitoring solutions before scaling to cooperative deployments.",
    "UjuziLab partner schools in the Rift Valley and Lake Victoria basins pilot capacitive soil moisture probes because they resist corrosion better than resistive nails in mineral-rich soils. Readings feed ESP32 or Arduino nodes that log to SD cards when connectivity is absent, then sync via campus Wi-Fi hotspots during market days.",
    "Smart agriculture is not only automation. Successful projects include farmer-facing SMS summaries in Kiswahili, visual traffic-light indicators on field posts, and integration with existing extension officer visit schedules. Technology that ignores literacy, language, and trust fails regardless of sensor accuracy.",
    "Energy autonomy distinguishes rural deployments. Solar panels sized for continuous sensing beat disposable alkaline batteries over a growing season. Students calculate duty cycles: wake, sample, transmit, deep sleep. These exercises connect computer science with agricultural science syllabi already taught in partner institutions.",
    "This course walks you from sensor physics through dashboard design, emphasising open data standards so county governments can aggregate anonymised trends without vendor lock-in. By the final module you will specify a pilot suitable for a half-acre school demonstration farm.",
  ]),

  pythonDataIntro: articleBody("Python for Community Data Projects", [
    "Python has emerged as the lingua franca of African data science clubs, civic hackathons, and public-health informatics traineeships. Its readable syntax lowers barriers for students who encounter programming first through mobile app courses or Arduino C++ sketches and now need to analyse CSV exports from weather stations, clinic registers, or market price scrapers.",
    "UjuziLab encourages community innovation projects where data tells stories policymakers can act on. A team in Kampala might visualise borehole dry-season levels; another in Kigali could map ambulance response times using openstreetmap geocodes. Pandas, Matplotlib, and Jupyter notebooks run comfortably on refurbished lab PCs common in partner hubs.",
    "Responsible data practice is woven throughout the curriculum. Learners anonymise patient identifiers, obtain community consent before GPS logging, and document provenance when merging government open data with citizen measurements. African GDPR-inspired frameworks and national statistics acts inform these lessons.",
    "You will practice cleaning messy real-world exports: mixed date formats, missing Kiswahili category labels, and currency columns with comma thousands separators. Functions become reusable modules shared across club repositories on GitHub.",
    "The capstone invites you to publish a narrative notebook plus a one-page policy brief aimed at a local ward administrator. Technical depth matters, but so does clarity for non-specialist readers who approve budgets for sensors, connectivity, or training.",
  ]),

  esp32LoraIntro: articleBody("ESP32 and LoRa for Rural Connectivity", [
    "Cellular coverage maps look impressive in capital cities, yet many African villages experience sporadic GPRS or expensive data bundles unsuitable for continuous telemetry. LoRa (Long Range) radio in sub-GHz bands enables kilometre-scale links between battery-powered field nodes and a gateway on a school roof or clinic veranda with a single affordable internet backhaul.",
    "The ESP32 microcontroller integrates Wi-Fi and Bluetooth while community firmware like LoRaWAN stacks runs on companion SX1276 modules popular in UjuziLab field kits. Students configure spreading factors, balancing range against airtime regulations set by communications authorities in Tanzania, Kenya, Rwanda, and Uganda.",
    "Real deployments start with link budgets: antenna height, cable loss, vegetation, and seasonal rain fade. A health centre monitoring vaccine fridge temperatures may require only hourly packets; irrigation controllers might tolerate ten-minute intervals. Over-the-air activation keys and device EUI management introduce security concepts often skipped in hobby tutorials.",
    "UjuziLab emphasises maintainability: labelled enclosures, conformal coating for humidity, and spare firmware images on SD cards technicians can flash without cloud dependencies. When gateways fail, store-and-forward on nodes prevents silent data loss during critical harvest or disease surveillance windows.",
    "By course end you will design a two-node network sketch for a rural site you know—perhaps a parent's farm or a partner clinic—including power budget, expected RSSI, and a fallback SMS alert path when LoRa links degrade.",
  ]),

  solarHealthIntro: articleBody("Solar Microgrids for Rural Health Centres", [
    "Reliable electricity remains elusive at many rural African health facilities where vaccine cold chains and maternity ward lighting depend on diesel generators or ad-hoc solar installations installed without load analysis. UjuziLab's solar microgrid course teaches technicians and engineering students to size PV arrays, battery banks, and charge controllers using site surveys rather than catalogue guesses.",
    "A typical Tanzanian dispensary might run a 12 V fridge, LED lights, phone charging for community health workers, and a router for telemedicine trials. Students inventory loads in watt-hours per day, apply derating for panel soiling and high ambient temperatures, and select MPPT controllers compatible with locally available lithium iron phosphate packs.",
    "Maintenance culture determines long-term success. Courses include torque checks on MC4 connectors, corrosion inspection in coastal Mkoa, and training clinic staff to read state-of-charge indicators. Partnerships with ministries of health increasingly require documented training before equipment donations ship.",
    "Microgrids also create STEM outreach opportunities: school students tour installations, log production data, and compare forecasts with measured yield—bridging physics curricula with community service.",
    "Your assignments progress from paper sizing exercises to interpreting data from a lab-scale bench mimicking East African irradiance profiles, preparing you to support real feasibility studies with NGOs and county energy offices.",
  ]),

  pcbKiCadIntro: articleBody("PCB Design with KiCad for African Hardware", [
    "Import duties and shipping delays make bespoke printed circuit boards expensive luxuries unless local designers master open-source EDA tools. KiCad has become the standard in African university electronics clubs because it is free, cross-platform, and supports community fabrication partnerships from Nairobi to Cape Town.",
    "UjuziLab hardware courses begin with schematic capture discipline: hierarchical sheets, consistent net labels, and footprints verified against vendor parts actually stocked by regional distributors. Students learn to avoid default European component sizes when local assembly houses prefer metric reel tapes.",
    "Design rule checks catch clearance violations before gerbers reach fabrication. African makers often panelise small boards with mouse bites to reduce per-unit cost, sharing panel space with classmates' projects—a practice encouraged in Dar es Salaam Institute of Technology lab sessions.",
    "Bring-up debugging receives equal attention: current-limited bench supplies, systematic reflow inspection, and firmware test points for I2C buses common in sensor shields. Documentation packages include assembly drawings with Kiswahili callouts where partner schools request bilingual maintenance guides.",
    "The course culminates in a manufacturable two-layer board supporting an ESP32 sensor node—your ticket to moving from breadboard prototypes to deployable hardware suitable for agricultural pilots or clinic environmental monitoring.",
  ]),

  flutterIntro: articleBody("Flutter for Locally Relevant Mobile Apps", [
    "Flutter enables African developers to ship polished Android apps—dominant across East African smartphone markets—from a single Dart codebase. UjuziLab mobile courses focus on offline-first patterns because users in peri-urban Nairobi or Kigali frequently lose connectivity on matatu commutes yet still need access to learning content, farm price alerts, or clinic queue updates.",
    "State management with Provider or Riverpod keeps UI reactive when syncing background data. Students integrate shared_preferences and sqflite for cached lessons, mirroring how UjuziLab's own learner app queues quiz submissions until Wi-Fi returns at campus hotspots.",
    "Localisation is not an afterthought. Flutter's intl package supports English, Kiswahili, and Kinyarwanda string tables in the same project students demo to community stakeholders. Right-to-left readiness is mentioned for teams collaborating across the continent.",
    "Material Design 3 theming allows brand alignment with school or county programmes without rewriting navigation. Accessibility—font scaling, contrast, TalkBack labels—supports inclusive classrooms mandated by partner ministries.",
    "You will prototype a community service app: perhaps market price comparison for mama mboga vendors or a borehole status reporter. Emphasis stays on maintainable folder structure and CI-friendly tests runnable on GitHub Actions free tiers common in student clubs.",
  ]),
};
