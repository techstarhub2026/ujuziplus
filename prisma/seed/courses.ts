import { PrismaClient } from "@prisma/client";
import {
  ARTICLES,
  articleBody,
  articleLesson,
  assignmentLesson,
  buildCourse,
  quizLesson,
  videoLesson,
} from "./course-helpers";

export type CourseIdMap = Record<string, string>;

// Educational YouTube URLs (Arduino / Flutter tutorials — not placeholder links)
const YT = {
  arduinoBeginners: "https://www.youtube.com/watch?v=fJWR7dBuc18",
  arduinoMotors: "https://www.youtube.com/watch?v=6FARPCsOCfY",
  flutterBeginners: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
  flutterState: "https://www.youtube.com/watch?v=VPvVD8t02Z8",
};

export async function seedCourses(
  db: PrismaClient,
  instructorId: string
): Promise<CourseIdMap> {
  const courseIds: CourseIdMap = {};

  const courses = [
  // ─── 1. Arduino Robotics (WITH VIDEO) ─────────────────────────────────────
    buildCourse(instructorId, {
      slug: "arduino-robotics-african-makers",
      title: "Arduino Robotics for African Makers",
      subtitle: "From breadboard basics to competition-ready line followers",
      description:
        "Hands-on robotics course tailored for East African school labs and makerspaces. Learn motor control, sensor fusion, and documentation practices used in UjuziLab regional science fairs. Requires the Arduino STEM Classroom Kit for capstone builds.",
      thumbnailUrl: "/content/courses/course-arduino-robotics.jpg",
      category: "Robotics",
      level: "BEGINNER",
      durationHours: 12,
      whatYouLearn: [
        "Wire safe Arduino circuits on breadboards",
        "Control DC motors with driver modules",
        "Calibrate IR sensors for local track surfaces",
        "Document prototypes for African innovation competitions",
      ],
      prerequisites:
        "Basic computer literacy. No prior programming required. Access to UjuziLab Arduino STEM Classroom Kit recommended.",
      targetAudience:
        "Secondary school students, robotics club members, and teachers in TechStar partner institutions.",
      linkedKitSlugs: ["arduino-stem-classroom-kit"],
      enableCert: true,
      certificateTemplatePath: "/content/certificates/certificate-template.jpg",
      modules: [
        {
          title: "Foundations of African Makers Robotics",
          orderIndex: 0,
          lessons: {
            create: [
              videoLesson(
                "Welcome: Robotics in East African Schools",
                "welcome-robotics-schools",
                0,
                YT.arduinoBeginners,
                720,
                true
              ),
              articleLesson(
                "Arduino for African Makers",
                "arduino-african-makers",
                1,
                ARTICLES.arduinoIntro
              ),
              quizLesson("Arduino & Breadboard Basics Quiz", "quiz-arduino-basics", 2, [
                {
                  text: "Why is a current-limiting resistor required when driving an LED from an Arduino GPIO pin?",
                  explanation: "GPIO pins supply limited current; resistors prevent LED burnout and pin damage.",
                  options: [
                    { text: "To increase LED brightness beyond safe levels", isCorrect: false },
                    { text: "To limit current and protect the LED and microcontroller pin", isCorrect: true },
                    { text: "To convert analogue signals to digital", isCorrect: false },
                    { text: "To step down mains voltage for the board", isCorrect: false },
                  ],
                },
                {
                  text: "Which power approach is most practical during load-shedding in Tanzanian school labs?",
                  options: [
                    { text: "Rely solely on wall mains without backup", isCorrect: false },
                    { text: "USB power banks or battery packs sized for the project", isCorrect: true },
                    { text: "Direct connection to 240V AC on the breadboard", isCorrect: false },
                    { text: "Remove all capacitors from the circuit", isCorrect: false },
                  ],
                },
                {
                  text: "What is the typical operating voltage of an Arduino Uno logic rail?",
                  options: [
                    { text: "3.3V only for all pins", isCorrect: false },
                    { text: "5V logic on standard digital I/O", isCorrect: true },
                    { text: "12V from USB by default", isCorrect: false },
                    { text: "48V for motor circuits", isCorrect: false },
                  ],
                },
              ]),
              articleLesson(
                "Breadboard Safety in Shared African Labs",
                "breadboard-safety",
                3,
                articleBody("Breadboard Safety in Shared African Labs", [
                  "Shared school labs across Nairobi, Dar es Salaam, and Kigali see hundreds of student hours per term. Breadboards accumulate bent leads, frayed jumper wires, and occasional short circuits when returning kits to storage drawers still powered. UjuziLab instructors begin every session with a safety ritual: power off, discharge capacitors if present, inspect wire ends, and assign each team a labelled kit tray.",
                  "Static discharge damage is rare on robust Uno clones yet still possible during dry Harmattan-influenced seasons in East Africa. Grounding mats are luxuries; practical mitigation includes touching grounded metal door frames before handling boards and storing ICs in anti-static bags recycled from component shipments.",
                  "Motor circuits introduce higher currents. Never route motor supply through breadboard power rails rated for signal-level current. Terminal blocks or dedicated driver modules mount beside the breadboard with clear colour coding: red for motor supply, black for ground, and distinct colours for logic signals.",
                  "Documentation photos help accountability when kits return damaged. Org admins using UjuziLab inventory portals compare checkout photos with return condition, reducing disputes and teaching students professional lab citizenship.",
                  "Mastering safe breadboard practice ensures your robotics club spends competition season tuning algorithms—not replacing burned drivers.",
                ])
              ),
            ],
          },
        },
        {
          title: "Motors, Sensors, and Line Following",
          orderIndex: 1,
          lessons: {
            create: [
              videoLesson(
                "Motor Drivers and PWM Speed Control",
                "motor-drivers-pwm",
                0,
                YT.arduinoMotors,
                840
              ),
              articleLesson(
                "Motor Control for Line-Following Robots",
                "motor-control-line-follow",
                1,
                ARTICLES.motorControl
              ),
              quizLesson("Motor Driver & Sensor Quiz", "quiz-motor-sensor", 2, [
                {
                  text: "Why use an L298N or similar driver instead of wiring motors directly to Arduino pins?",
                  options: [
                    { text: "Motors need more current than GPIO pins can provide", isCorrect: true },
                    { text: "Drivers reduce code size in kilobytes", isCorrect: false },
                    { text: "Arduino pins output AC suitable for motors", isCorrect: false },
                    { text: "Drivers convert C++ to machine language", isCorrect: false },
                  ],
                },
                {
                  text: "When calibrating IR line sensors on tiled school corridors, what environmental factor matters most?",
                  options: [
                    { text: "Ambient light from windows affecting reflectance", isCorrect: true },
                    { text: "Ocean salinity", isCorrect: false },
                    { text: "Keyboard layout on lab PCs", isCorrect: false },
                    { text: "Monitor refresh rate", isCorrect: false },
                  ],
                },
              ]),
              articleLesson(
                "PID Tuning for School Competition Tracks",
                "pid-tuning-competition",
                3,
                articleBody("PID Tuning for School Competition Tracks", [
                  "Proportional-Integral-Derivative control transforms jittery line followers into smooth competitors. African UjuziLab fairs often set tracks on polished tile or painted concrete—surfaces with different friction than MDF test boards in online tutorials. Start with proportional-only steering: if the robot overshoots curves, reduce Kp before touching integral gain.",
                  "Integral term fixes steady-state error when one motor is slightly weaker—a common issue with budget gear motors sourced from regional suppliers. Cap integral windup to prevent spiralling oscillation on sharp 90-degree turns taped for secondary school divisions.",
                  "Derivative term dampens oscillation but amplifies sensor noise. Many winning student teams in Kampala hubs low-pass filter analogue IR readings in software before applying D gain.",
                  "Log tuning sessions in a notebook: Kp, Ki, Kd values, battery voltage, and track segment notes. Judges increasingly award documentation marks alongside lap times.",
                  "Practice with the same power source you will use on competition day; sagging USB packs change motor RPM and invalidate prior tuning.",
                ])
              ),
            ],
          },
        },
        {
          title: "Capstone: Build and Document",
          orderIndex: 2,
          lessons: {
            create: [
              articleLesson(
                "Preparing for Regional Robotics Fairs",
                "regional-fair-prep",
                0,
                articleBody("Preparing for Regional Robotics Fairs", [
                  "UjuziLab-affiliated fairs in Tanzania, Kenya, Rwanda, and Uganda celebrate prototypes that solve community problems—not only lap times. Your team narrative should explain who benefits if your robot platform scales: farmers, clinic aides, or warehouse students stocking textbooks.",
                  "Mechanical reliability separates finalists. Hot-glue is acceptable for prototypes but zip ties, acrylic plates, and labelled wiring earn maintainability points. Carry spare motor drivers, dupont leads, and a printed wiring diagram.",
                  "Oral defence questions often cover power budgeting and sensor failure modes. Practice explaining what happens if one IR sensor drifts out of calibration mid-run.",
                  "Photograph progress milestones for your UjuziLab portfolio project gallery. Authentic documentation beats stock imagery when applying for hub residencies.",
                  "Remember sportsmanship: East Africa's maker community grows when teams share spare parts and troubleshoot rivals' grounding issues cordially.",
                ])
              ),
              assignmentLesson(
                "Line-Following Robot Capstone",
                "capstone-line-follower",
                1,
                "Build a differential-drive line-following robot using the UjuziLab Arduino STEM Classroom Kit. Submit: (1) wiring schematic photo or Fritzing export, (2) 60-second video on a school corridor or taped track, (3) brief report describing PID or proportional tuning values and battery choice. Explain how your design suits local floor surfaces.",
                100
              ),
              quizLesson("Robotics Capstone Review", "quiz-capstone-review", 2, [
                {
                  text: "What documentation best demonstrates maintainability to competition judges?",
                  options: [
                    { text: "Unlabelled bird's nest wiring", isCorrect: false },
                    { text: "Printed wiring diagram with colour codes and spare parts list", isCorrect: true },
                    { text: "Only source code without hardware photos", isCorrect: false },
                    { text: "Social media repost without attribution", isCorrect: false },
                  ],
                },
              ]),
            ],
          },
        },
      ],
    }),

    // ─── 2. Flutter Mobile (WITH VIDEO) ───────────────────────────────────────
    buildCourse(instructorId, {
      slug: "flutter-mobile-local-solutions",
      title: "Flutter Mobile Apps for Local Solutions",
      subtitle: "Offline-first Android apps for East African communities",
      description:
        "Learn Flutter and Dart by building apps that work when connectivity drops—market price tools, clinic queue trackers, and offline learning readers. Aligned with UjuziLab mobile innovation tracks.",
      thumbnailUrl: "/content/courses/course-flutter-mobile.jpg",
      category: "Software",
      level: "INTERMEDIATE",
      durationHours: 14,
      whatYouLearn: [
        "Structure Flutter projects for maintainability",
        "Implement offline caching with sqflite",
        "Localise apps in English and Kiswahili",
        "Ship APK builds for Android dominant markets",
      ],
      prerequisites: "Introductory programming in any language. Laptop with Flutter SDK installed.",
      targetAudience: "University students, hub developers, and teachers building school apps.",
      linkedKitSlugs: [],
      enableCert: true,
      modules: [
        {
          title: "Flutter Foundations",
          orderIndex: 0,
          lessons: {
            create: [
              videoLesson(
                "Flutter & Dart Crash Course for Beginners",
                "flutter-dart-crash",
                0,
                YT.flutterBeginners,
                3600,
                true
              ),
              articleLesson("Flutter for Locally Relevant Mobile Apps", "flutter-local-apps", 1, ARTICLES.flutterIntro),
              quizLesson("Dart & Widget Basics Quiz", "quiz-dart-widgets", 2, [
                {
                  text: "Why is offline-first design critical for UjuziLab learners in peri-urban areas?",
                  options: [
                    { text: "Connectivity is intermittent on commutes and rural edges", isCorrect: true },
                    { text: "Android forbids network APIs", isCorrect: false },
                    { text: "Flutter cannot use HTTP", isCorrect: false },
                    { text: "SQLite is unavailable on mobile", isCorrect: false },
                  ],
                },
                {
                  text: "Which widget tree concept rebuilds UI when state changes?",
                  options: [
                    { text: "StatelessWidget only", isCorrect: false },
                    { text: "StatefulWidget or state management layer", isCorrect: true },
                    { text: "main() function exclusively", isCorrect: false },
                    { text: "pubspec.yaml", isCorrect: false },
                  ],
                },
              ]),
              articleLesson(
                "Project Structure for Student Teams",
                "flutter-project-structure",
                3,
                articleBody("Project Structure for Student Teams", [
                  "African university hackathon teams often dissolve after events because repositories become spaghetti. UjuziLab teaches feature-first folders: lib/features/market_prices/, lib/features/auth/, and shared core/ utilities. Each feature owns its widgets, providers, and repository interfaces.",
                  "Environment flavours separate sandbox API keys from production—critical when integrating mobile money sandboxes mandated by Tanzanian and Kenyan regulators. Never commit secrets; use dart-define or CI variables on GitHub Actions runners.",
                  "Code review culture grows through pull request templates asking: Does this work offline? Are strings localised? Does TalkBack read labels? Inclusive defaults differentiate apps destined for ministry partnerships.",
                  "Continuous integration on free tiers runs flutter test and flutter analyze on every push—cheap insurance before demo day in front of county ICT officers.",
                  "Adopt this structure early; refactoring after midterms is painful when three teammates share one laptop.",
                ])
              ),
            ],
          },
        },
        {
          title: "State and Offline Data",
          orderIndex: 1,
          lessons: {
            create: [
              videoLesson(
                "Flutter State Management Explained",
                "flutter-state-mgmt",
                0,
                YT.flutterState,
                1200
              ),
              articleLesson(
                "Offline-First Patterns for African Connectivity",
                "offline-first-patterns",
                1,
                articleBody("Offline-First Patterns for African Connectivity", [
                  "Assume the network will fail mid-request. UjuziLab reference apps queue quiz submissions and sync when the learner reaches campus Wi-Fi—pattern you will replicate with a local SQLite table and a background sync worker using connectivity_plus.",
                  "Optimistic UI updates make apps feel responsive: show a pending icon beside unsynced rows rather than blocking the farmer with spinners. Conflict resolution rules must be documented—last-write-wins is acceptable for price alerts but dangerous for clinic queue tokens.",
                  "Binary assets (lesson PDFs) download on Wi-Fi only; settings screens expose 'sync on mobile data' toggles respecting expensive bundles.",
                  "Testing offline behaviour requires airplane mode discipline during QA, not merely mocking repositories in unit tests.",
                  "Ministries and NGOs auditing grant deliverables appreciate architecture diagrams showing sync flows—include one in your portfolio README.",
                ])
              ),
              quizLesson("Offline & State Quiz", "quiz-offline-state", 2, [
                {
                  text: "Which package commonly detects network status changes in Flutter?",
                  options: [
                    { text: "connectivity_plus", isCorrect: true },
                    { text: "motor_driver", isCorrect: false },
                    { text: "loRaWAN", isCorrect: false },
                    { text: "kicad_pcb", isCorrect: false },
                  ],
                },
              ]),
              articleLesson(
                "Caching Lesson Content Locally",
                "caching-lessons",
                3,
                articleBody("Caching Lesson Content Locally", [
                  "UjuziLab course videos may stream from CDN endpoints, but reading materials and quizzes should cache for rural learners. Use path_provider for app documents directory and store JSON manifests listing lesson ids, hashes, and expiry.",
                  "Version manifests when instructors update articles; stale caches confuse students preparing for national practical exams.",
                  "Encrypt sensitive health demo data at rest if your prototype handles clinic queues—even training apps should model HIPAA-aligned habits.",
                  "Surface storage usage in settings so users on 32GB phones can clear caches before installing large offline maps.",
                  "Document cache invalidation strategy in your assignment README; reviewers look for thoughtful edge cases, not only happy-path demos.",
                ])
              ),
            ],
          },
        },
        {
          title: "Localisation and Release",
          orderIndex: 2,
          lessons: {
            create: [
              articleLesson(
                "Kiswahili and English Localisation",
                "localisation-sw-en",
                0,
                articleBody("Kiswahili and English Localisation", [
                  "Flutter's intl package and ARB files separate translations from widget code. UjuziLab recommends naming keys by feature: marketPrices_title rather than generic label1. Kiswahili plural rules and gendered job titles in agriculture copy need reviewer pass from native speakers—not Google Translate alone.",
                  "Date and currency formatting must follow locales: TZS and KES separators, 24-hour clocks common in official documents. Test long translated strings on small screens used widely in East Africa.",
                  "Right-to-left layouts may matter for teams collaborating with North African hubs; Directionality widgets wrap previews during design reviews.",
                  "Pseudolocale builds stretch UI before translators deliver final strings.",
                  "Localisation is equity: farmers engage deeper when voice and text respect mother tongues.",
                ])
              ),
              articleLesson(
                "Releasing APKs to Community Pilots",
                "release-apk-pilots",
                1,
                articleBody("Releasing APKs to Community Pilots", [
                  "Play Store releases are ideal but school pilots often sideload APKs via shared drives. Sign release builds with a team keystore stored offline—not committed to Git. Document SHA fingerprints if integrating Firebase Cloud Messaging for UjuziLab push notifications.",
                  "Version code monotonic increases prevent downgrade attacks when hub mentors distribute updates over Bluetooth during field visits.",
                  "Privacy policies must disclose location and SMS permissions if your app uses them; county partnerships stall without plain-language Kiswahili policy links.",
                  "Crash reporting via Firebase Crashlytics helps, but respect student data minimisation policies in partner schools.",
                  "Pilot feedback forms in Google Sheets or offline equivalents close the loop before v1.0 ministry submissions.",
                ])
              ),
              quizLesson("Flutter Release Readiness Quiz", "quiz-release-ready", 2, [
                {
                  text: "Before sideloading a pilot APK to a rural school, you must:",
                  options: [
                    { text: "Sign with a release keystore and document version codes", isCorrect: true },
                    { text: "Disable all permissions always", isCorrect: false },
                    { text: "Hardcode production API secrets in source", isCorrect: false },
                    { text: "Skip privacy policy if app is free", isCorrect: false },
                  ],
                },
              ]),
              assignmentLesson(
                "Community App Prototype",
                "assignment-community-app",
                3,
                "Prototype a Flutter app solving a local community problem (market prices, borehole status, or offline lesson reader). Submit GitHub URL, screenshot gallery, and 200-word architecture note covering offline strategy and localisation. APK optional but encouraged.",
                100
              ),
            ],
          },
        },
      ],
    }),

    // ─── 3–7: No-video courses ──────────────────────────────────────────────
    ...buildTextOnlyCourses(instructorId),
  ];

  for (const courseData of courses) {
    const { slug, title, certTemplate, ...courseFields } = courseData;
    const created = await db.course.upsert({
      where: { slug: slug! },
      update: courseFields,
      create: courseData,
    });
    courseIds[slug!] = created.id;
    console.log(`  ✓ Course: ${title}`);
  }

  return courseIds;
}

function buildTextOnlyCourses(instructorId: string) {
  const iotAgri = buildCourse(instructorId, {
    slug: "iot-smart-agriculture-east-africa",
    title: "IoT Smart Agriculture for East Africa",
    subtitle: "Sensor networks for school farms and smallholder pilots",
    description:
      "Design soil moisture and microclimate monitoring for East African agriculture. Covers sensor selection, ESP32 data logging, dashboard ethics, and farmer-centred design without requiring video bandwidth.",
    thumbnailUrl: "/content/courses/course-iot-farming.jpg",
    category: "IoT",
    level: "INTERMEDIATE",
    durationHours: 10,
    whatYouLearn: [
      "Select corrosion-resistant soil sensors",
      "Log data offline on SD cards",
      "Design farmer-readable indicators",
      "Plan solar-powered node duty cycles",
    ],
    prerequisites: "Basic Arduino or ESP32 exposure helpful. UjuziLab ESP32 Field Kit recommended.",
    targetAudience: "Agritech club members, extension trainees, and environmental science students.",
    linkedKitSlugs: ["esp32-iot-field-kit"],
    modules: textOnlyModules("iot-agri", ARTICLES.iotAgriOverview, "irrigation"),
  });

  const pythonData = buildCourse(instructorId, {
    slug: "python-data-community-innovation",
    title: "Python Data Science for Community Innovation",
    subtitle: "Analyse civic datasets and tell stories that move policy",
    description:
      "Use Python, Pandas, and Jupyter to clean and visualise community data—from borehole levels to market prices—with ethics modules aligned to African open-data practice.",
    thumbnailUrl: "/content/courses/course-python-data.jpg",
    category: "Data Science",
    level: "BEGINNER",
    durationHours: 11,
    whatYouLearn: [
      "Clean messy CSV exports with Pandas",
      "Visualise trends for non-technical audiences",
      "Anonymise sensitive community data",
      "Publish narrative notebooks and policy briefs",
    ],
    prerequisites: "Introductory programming. Laptop with Python 3.10+.",
    targetAudience: "Hackathon teams, statistics students, and civic tech volunteers.",
    linkedKitSlugs: [],
    modules: textOnlyModules("python-data", ARTICLES.pythonDataIntro, "policy-brief"),
  });

  const esp32Lora = buildCourse(instructorId, {
    slug: "esp32-lora-rural-connectivity",
    title: "ESP32 & LoRa Rural Connectivity",
    subtitle: "Long-range links for clinics, farms, and schools",
    description:
      "Build battery-powered LoRa nodes and gateway planning skills for villages where cellular data is costly. Security, link budgets, and maintainable enclosures emphasised.",
    thumbnailUrl: "/content/courses/course-esp32-lora.jpg",
    category: "IoT",
    level: "ADVANCED",
    durationHours: 9,
    whatYouLearn: [
      "Configure LoRa spreading factors",
      "Calculate rural link budgets",
      "Implement deep-sleep power schedules",
      "Document maintainable field enclosures",
    ],
    prerequisites: "Embedded C++ basics and completion of IoT agriculture course or equivalent.",
    targetAudience: "Field technicians, final-year engineering students, and hub fellows.",
    linkedKitSlugs: ["esp32-iot-field-kit"],
    modules: textOnlyModules("esp32-lora", ARTICLES.esp32LoraIntro, "link-budget"),
  });

  const solarHealth = buildCourse(instructorId, {
    slug: "solar-microgrids-health-centres",
    title: "Solar Microgrids for Rural Health Centres",
    subtitle: "Size PV systems for vaccine cold chains and critical loads",
    description:
      "Technician-oriented course on surveying clinic loads, sizing arrays and batteries, and training staff on maintenance in humid and dusty East African climates.",
    thumbnailUrl: "/content/courses/course-solar-health.jpg",
    category: "Energy",
    level: "INTERMEDIATE",
    durationHours: 8,
    whatYouLearn: [
      "Survey clinic electrical loads",
      "Size MPPT controllers and LiFePO4 banks",
      "Produce bilingual maintenance schedules",
      "Interpret bench irradiance test data",
    ],
    prerequisites: "Secondary physics and basic algebra. Solar Learning Lab Kit recommended.",
    targetAudience: "Renewable energy trainees, biomedical equipment officers, and STEM teachers.",
    linkedKitSlugs: ["solar-learning-lab-kit"],
    modules: textOnlyModules("solar-health", ARTICLES.solarHealthIntro, "clinic-sizing"),
  });

  const pcbKiCad = buildCourse(instructorId, {
    slug: "pcb-design-kicad-hardware",
    title: "PCB Design with KiCad for African Hardware",
    subtitle: "From schematic to manufacturable gerbers on a student budget",
    description:
      "Open-source PCB design workflow for ESP32 sensor nodes using parts available from regional distributors. DRC, panelisation, and assembly documentation included.",
    thumbnailUrl: "/content/courses/course-pcb-kicad.jpg",
    category: "Hardware",
    level: "ADVANCED",
    durationHours: 13,
    whatYouLearn: [
      "Capture schematics with hierarchical sheets",
      "Assign footprints for locally stocked parts",
      "Run DRC and export gerbers",
      "Prepare assembly docs for local fab houses",
    ],
    prerequisites: "Basic electronics and soldering. Prior breadboard prototyping experience.",
    targetAudience: "Hardware club members and entrepreneurs moving beyond prototypes.",
    linkedKitSlugs: ["esp32-iot-field-kit"],
    modules: textOnlyModules("pcb-kicad", ARTICLES.pcbKiCadIntro, "gerber-submission"),
  });

  return [iotAgri, pythonData, esp32Lora, solarHealth, pcbKiCad];
}

function textOnlyModules(
  prefix: string,
  introArticle: string,
  assignmentSlug: string
) {
  const extraArticles = (topic: string, focus: string) =>
    articleBody(topic, [
      `${focus} represents a core competency in UjuziLab's African STEM pipeline. Learners across Tanzania, Kenya, Uganda, and Rwanda apply these skills in contexts where imported turnkey solutions fail due to cost, customs delays, or lack of local maintenance expertise.`,
      `Partner institutions emphasise documentation in languages communities understand. Technical accuracy must pair with stakeholder communication—county agricultural officers, clinic matrons, and head teachers approve pilots when teams explain risks and service intervals clearly.`,
      `Field conditions differ from textbook examples: dust, rodents, voltage sags, and intermittent connectivity. Designs must tolerate imperfection while remaining auditable for grant reporting.`,
      `Open-source tooling reduces vendor lock-in. Students archive gerbers, notebooks, and firmware on institutional GitHub organisations with SPDX licences clarifying reuse for sister schools.`,
      `Capstone work feeds UjuziLab innovation showcases and regional competitions. Judges reward reproducibility: another school should rebuild your project from published artefacts without guessing hidden steps.`,
      `Measure impact beyond grades: litres of water saved, hours of clinic lighting restored, or farmers receiving actionable moisture alerts. African STEM education succeeds when metrics speak to community outcomes.`,
    ]);

  return [
    {
      title: "Module 1: Context and Foundations",
      orderIndex: 0,
      lessons: {
        create: [
          articleLesson(`Introduction`, `${prefix}-intro`, 0, introArticle, true),
          articleLesson(`Regional Case Studies`, `${prefix}-cases`, 1, extraArticles("Regional Case Studies", "Case study analysis")),
          quizLesson(`${prefix} Foundations Quiz`, `${prefix}-quiz-m1`, 2, [
            {
              text: "What distinguishes successful UjuziLab field projects in rural East Africa?",
              options: [
                { text: "Maintainability and community-appropriate communication", isCorrect: true },
                { text: "Exclusive use of imported proprietary clouds", isCorrect: false },
                { text: "Ignoring local language requirements", isCorrect: false },
                { text: "Skipping documentation to save time", isCorrect: false },
              ],
            },
            {
              text: "Why is open-source tooling emphasised in partner school labs?",
              options: [
                { text: "Reduces lock-in and enables sister schools to reproduce work", isCorrect: true },
                { text: "It eliminates the need for safety training", isCorrect: false },
                { text: "It prevents using any commercial parts", isCorrect: false },
                { text: "It removes firmware update requirements", isCorrect: false },
              ],
            },
          ]),
          articleLesson(`Stakeholder Mapping`, `${prefix}-stakeholders`, 3, extraArticles("Stakeholder Mapping", "Stakeholder engagement")),
          articleLesson(`Safety and Compliance`, `${prefix}-safety`, 4, extraArticles("Safety and Compliance", "Regulatory awareness")),
        ],
      },
    },
    {
      title: "Module 2: Technical Deep Dive",
      orderIndex: 1,
      lessons: {
        create: [
          articleLesson(`Core Concepts`, `${prefix}-core`, 0, extraArticles("Core Technical Concepts", "Technical foundations")),
          articleLesson(`Tools and Instrumentation`, `${prefix}-tools`, 1, extraArticles("Tools and Instrumentation", "Measurement discipline")),
          quizLesson(`${prefix} Technical Quiz`, `${prefix}-quiz-m2`, 2, [
            {
              text: "When logging field sensor data offline, what practice prevents silent data loss?",
              options: [
                { text: "Timestamped local storage with sync verification", isCorrect: true },
                { text: "Deleting CSV files after each read", isCorrect: false },
                { text: "Using only cloud APIs without fallback", isCorrect: false },
                { text: "Disabling checksums to save space", isCorrect: false },
              ],
            },
          ]),
          articleLesson(`Prototyping Workflow`, `${prefix}-prototype`, 3, extraArticles("Prototyping Workflow", "Iterative prototyping")),
          articleLesson(`Testing in Real Conditions`, `${prefix}-testing`, 4, extraArticles("Field Testing", "Validation outdoors")),
        ],
      },
    },
    {
      title: "Module 3: Deployment and Operations",
      orderIndex: 2,
      lessons: {
        create: [
          articleLesson(`Deployment Planning`, `${prefix}-deploy`, 0, extraArticles("Deployment Planning", "Rollout planning")),
          articleLesson(`Maintenance Culture`, `${prefix}-maintenance`, 1, extraArticles("Maintenance Culture", "Sustainable operations")),
          quizLesson(`${prefix} Operations Quiz`, `${prefix}-quiz-m3`, 2, [
            {
              text: "Training clinic or school staff primarily helps:",
              options: [
                { text: "Ensure equipment survives after installer teams leave", isCorrect: true },
                { text: "Eliminate need for spare parts", isCorrect: false },
                { text: "Avoid all documentation", isCorrect: false },
                { text: "Bypass national regulators", isCorrect: false },
              ],
            },
          ]),
          articleLesson(`Monitoring and Feedback`, `${prefix}-monitoring`, 3, extraArticles("Monitoring and Feedback", "Continuous improvement")),
          assignmentLesson(
            `Practical Field Assignment`,
            `${prefix}-assignment-prep`,
            4,
            `Complete a field-ready plan document for a site in your community. Include stakeholder list, risk register, bill of materials sourced from regional suppliers, and maintenance schedule. Course-specific focus: ${assignmentSlug.replace(/-/g, " ")}.`,
            100
          ),
        ],
      },
    },
    {
      title: "Module 4: Capstone and Showcase",
      orderIndex: 3,
      lessons: {
        create: [
          articleLesson(`Capstone Expectations`, `${prefix}-capstone-intro`, 0, extraArticles("Capstone Expectations", "Showcase preparation")),
          articleLesson(`Portfolio Documentation`, `${prefix}-portfolio`, 1, extraArticles("Portfolio Documentation", "Evidence collection")),
          quizLesson(`${prefix} Final Review`, `${prefix}-quiz-final`, 2, [
            {
              text: "Grant reviewers and fair judges prioritise:",
              options: [
                { text: "Reproducible artefacts and community impact narrative", isCorrect: true },
                { text: "Maximum buzzwords without demos", isCorrect: false },
                { text: "Closed-source binaries only", isCorrect: false },
                { text: "Missing bill of materials", isCorrect: false },
              ],
            },
          ]),
          assignmentLesson(
            `Capstone Submission`,
            `${prefix}-${assignmentSlug}`,
            3,
            `Submit your capstone package: technical report (800+ words), photos or diagrams, and reflection on African context relevance. Align with UjuziLab showcase rubric categories: technical merit, community fit, and reproducibility.`,
            100
          ),
        ],
      },
    },
  ];
}
