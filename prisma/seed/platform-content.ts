import { PrismaClient } from "@prisma/client";
import { CourseIdMap } from "./courses";
import { UserIdMap } from "./users";

export async function seedPlatformContent(
  db: PrismaClient,
  userIds: UserIdMap,
  courseIds: CourseIdMap
): Promise<void> {
  const studentId = userIds["student@ujuzilab.com"];
  const instructorId = userIds["instructor@ujuzilab.com"];
  const adminId = userIds["admin@ujuzilab.com"];

  // ─── Programs (2) ──────────────────────────────────────────────────────────
  const programs = [
    {
      slug: "ujuzi-stem-residency-2026",
      title: "UjuziLab STEM Residency 2026",
      type: "Residency",
      description:
        "Six-week hybrid residency for East African youth teams building IoT prototypes with mentor support from Dar es Salaam and Nairobi hubs. Includes kit allocation, pitch coaching, and showcase at the Ujuzi Innovation Expo.",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-08-15"),
      format: "HYBRID" as const,
      seats: 40,
      enrolledCount: 12,
      price: 0,
      status: "OPEN" as const,
    },
    {
      slug: "arduino-educator-certification",
      title: "Arduino Educator Certification for African Teachers",
      type: "Certification",
      description:
        "Professional development track for secondary teachers delivering UjuziLab robotics curricula. Combines online modules, in-person lab intensives at partner universities, and classroom observation rubrics.",
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-09-30"),
      format: "HYBRID" as const,
      seats: 60,
      enrolledCount: 28,
      price: 75000,
      status: "OPEN" as const,
    },
  ];

  for (const p of programs) {
    await db.program.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    console.log(`  ✓ Program: ${p.title}`);
  }

  // ─── Competitions (2) ─────────────────────────────────────────────────────
  const competitions = [
    {
      slug: "east-africa-iot-challenge-2026",
      title: "East Africa IoT Challenge 2026",
      description:
        "Regional competition for student teams deploying sensor networks addressing agriculture, health, or water challenges. Finals hosted at Dar es Salaam Institute of Technology with kit bursaries for top prototypes.",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-10-15"),
      prize: "TZS 3,000,000 + ESP32 field kits + mentorship",
      teamsCount: 24,
      status: "REGISTRATION_OPEN" as const,
    },
    {
      slug: "african-robotics-league-2026",
      title: "African Robotics League 2026",
      description:
        "Line-following and sumo divisions for schools using the UjuziLab Arduino STEM Classroom Kit. Country qualifiers in Kenya, Tanzania, Rwanda, and Uganda feed the regional championship.",
      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-11-30"),
      prize: "Robotics lab grants + instructor training scholarships",
      teamsCount: 56,
      status: "REGISTRATION_OPEN" as const,
    },
  ];

  for (const c of competitions) {
    await db.competition.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    console.log(`  ✓ Competition: ${c.title}`);
  }

  // ─── Solutions (3) ───────────────────────────────────────────────────────
  const solutions = [
    {
      slug: "smart-irrigation-soil-moisture",
      title: "Smart Irrigation with Soil Moisture Sensing",
      subtitle: "UjuziLab · 3h · Intermediate",
      description:
        "Deploy capacitive soil moisture probes with ESP32 nodes to automate irrigation on school demonstration farms. Includes farmer SMS alert patterns and solar duty-cycle planning.",
      level: "INTERMEDIATE" as const,
      hours: 3,
      components: ["ESP32 dev board", "Capacitive soil moisture v1.2", "5V relay module", "DHT22 sensor", "18650 battery pack"],
      relatedKitSlugs: ["esp32-iot-field-kit"],
      labSteps: [
        "Calibrate moisture sensor in local soil samples",
        "Wire relay and pump safety interlock",
        "Implement deep-sleep sampling sketch",
        "Configure threshold alerts and manual override",
        "Field test on 10m² plot with data logging",
      ],
      codeTemplate: `// UjuziLab smart irrigation sketch\n#include <WiFi.h>\n#define MOISTURE_PIN 34\n#define RELAY_PIN 26\nvoid setup() { pinMode(RELAY_PIN, OUTPUT); }\nvoid loop() {\n  int moisture = analogRead(MOISTURE_PIN);\n  digitalWrite(RELAY_PIN, moisture > 2800 ? HIGH : LOW);\n  delay(60000);\n}`,
    },
    {
      slug: "clinic-fridge-temperature-monitor",
      title: "Clinic Vaccine Fridge Temperature Monitor",
      subtitle: "UjuziLab · 2h · Beginner",
      description:
        "LoRa-enabled temperature logging for rural vaccine cold chains with audible local alarms and gateway uplink when connectivity permits.",
      level: "BEGINNER" as const,
      hours: 2,
      components: ["DS18B20 waterproof probe", "ESP32", "SX1276 LoRa module", "Buzzer", "OLED display"],
      relatedKitSlugs: ["esp32-iot-field-kit"],
      labSteps: [
        "Mount DS18B20 probe in fridge test chamber",
        "Display live temperature on OLED",
        "Set 2–8°C alarm thresholds per WHO guidance",
        "Packetise readings for LoRa gateway",
        "Document clinic staff response procedure",
      ],
    },
    {
      slug: "solar-microgrid-load-controller",
      title: "Solar Microgrid Load Controller",
      subtitle: "UjuziLab · 4h · Advanced",
      description:
        "Prioritise critical health centre loads during low state-of-charge events using relay scheduling and clinician-facing indicator panel.",
      level: "ADVANCED" as const,
      hours: 4,
      components: ["MPPT charge controller", "LiFePO4 battery", "Current sensor module", "ESP32", "Priority relay board"],
      relatedKitSlugs: ["solar-learning-lab-kit"],
      labSteps: [
        "Survey clinic load watt-hour profile",
        "Integrate battery voltage and current sensing",
        "Program load shedding priority table",
        "Simulate cloudy-day scenarios on bench kit",
        "Train staff on manual bypass procedure",
      ],
    },
  ];

  for (const s of solutions) {
    await db.solution.upsert({
      where: { slug: s.slug },
      update: { ...s, status: "PUBLISHED" },
      create: { ...s, status: "PUBLISHED" },
    });
    console.log(`  ✓ Solution: ${s.title}`);
  }

  // ─── Lab resources (6) ────────────────────────────────────────────────────
  const labResources = [
    {
      slug: "arduino-uno-r3",
      title: "Arduino Uno R3 Reference Board",
      description: "ATmega328P-based board used in UjuziLab classroom kits. 5V logic, 14 digital I/O, 6 analogue inputs.",
      type: "BOARD" as const,
      category: "Robotics",
      thumbnailUrl: "/content/components/component-arduino-uno.jpg",
      externalUrl: "https://docs.arduino.cc/hardware/uno-rev3",
    },
    {
      slug: "esp32-wroom-32",
      title: "ESP32-WROOM-32 Dev Module",
      description: "Wi-Fi and BLE microcontroller for IoT field kits. Supports deep sleep for battery deployments.",
      type: "BOARD" as const,
      category: "IoT",
      thumbnailUrl: "/content/components/component-esp32.jpg",
    },
    {
      slug: "dht22-sensor",
      title: "DHT22 Temperature & Humidity Sensor",
      description: "Digital environmental sensor for agriculture and clinic monitoring labs.",
      type: "SENSOR" as const,
      category: "IoT",
      thumbnailUrl: "/content/components/component-dht22.jpg",
    },
    {
      slug: "capacitive-soil-moisture",
      title: "Capacitive Soil Moisture Sensor v1.2",
      description: "Corrosion-resistant probe for East African soil types. Analog output for ESP32 ADC.",
      type: "SENSOR" as const,
      category: "Agriculture",
      thumbnailUrl: "/content/components/component-soil-sensor.jpg",
    },
    {
      slug: "sx1276-lora-module",
      title: "SX1276 LoRa Radio Module 868MHz",
      description: "Sub-GHz transceiver for rural point-to-point and LoRaWAN gateway projects.",
      type: "COMPONENT" as const,
      category: "Connectivity",
      thumbnailUrl: "/content/components/component-lora.jpg",
    },
    {
      slug: "kicad-quick-start-guide",
      title: "KiCad Quick Start for African Fab Houses",
      description: "UjuziLab PDF guide covering schematic capture, footprint assignment, DRC, and gerber export for regional PCB manufacturers.",
      type: "GUIDE" as const,
      category: "Hardware",
      fileUrl: "/content/lab/kicad-quick-start.pdf",
      thumbnailUrl: "/content/courses/course-pcb-kicad.jpg",
    },
  ];

  for (const r of labResources) {
    await db.labResource.upsert({
      where: { slug: r.slug },
      update: r,
      create: r,
    });
    console.log(`  ✓ Lab resource: ${r.title}`);
  }

  // ─── Blog posts (3) ───────────────────────────────────────────────────────
  const blogPosts = [
    {
      slug: "stem-africa-ujuzilab-2026",
      title: "STEM Education in Africa: The UjuziLab Model",
      excerpt: "How integrated LMS, kits, and org portals accelerate hands-on learning from Dar es Salaam to Nairobi.",
      body: `African learners thrive when theory connects to tactile prototyping. UjuziLab bundles courses, classroom kits, IoT solutions workspaces, and organisation inventory tools so a robotics club in Kigali uses the same curriculum assets as a university lab in Dar es Salaam.

TechStar partnership hubs report three outcomes: faster procurement cycles through org kit requests, higher course completion when kits align with lessons, and stronger competition pipelines when students document projects in the showcase gallery.

Mobile money integration matters. Learners and schools pay with M-Pesa, Airtel Money, and Tigo Pesa rails they already trust—reducing friction for paid certifications and kit reorders.

The 2026 roadmap expands LoRa field solutions, solar microgrid technician pathways, and Flutter courses emphasising offline-first apps for peri-urban communities. Join the residency programme or Arduino educator certification to bring UjuziLab to your institution.`,
      category: "Insights",
      publishedAt: new Date("2026-05-22"),
    },
    {
      slug: "robotics-clubs-east-africa",
      title: "Building Robotics Clubs That Last in East African Schools",
      excerpt: "Inventory systems, teacher training, and competition calendars that keep clubs active year-round.",
      body: `Robotics clubs often launch with donor excitement then stall when kits break and teachers lack spare time. UjuziLab org admins track kit checkout, reorder levels, and allocated quantities per classroom—mirroring practices from Dar es Salaam Institute of Technology labs.

Sarah Kamau's Arduino robotics course pairs with the STEM Classroom Kit so students aren't hunting mismatched components mid-lesson. Teacher certification cohorts meet during school holidays, reducing timetable conflict.

Competition calendars anchor motivation: term-one line followers, term-two IoT agriculture prototypes, term-three regional qualifiers. Document every build in the projects gallery to attract ministry visitors and alumni mentors.

Sustainability beats spectacle. Clubs that measure impact—girls' participation rates, kits returned intact, community demo days—earn repeat grants.`,
      category: "Tutorial",
      publishedAt: new Date("2026-05-08"),
    },
    {
      slug: "lora-rural-health-iot",
      title: "LoRa IoT for Rural Health Centres: Lessons from the Field",
      excerpt: "Temperature monitoring pilots that respect clinic workflows and intermittent connectivity.",
      body: `Vaccine cold chain failures still threaten rural immunisation campaigns. UjuziLab's clinic fridge solution combines DS18B20 probes, local buzzer alarms, and LoRa uplinks to district gateways—so nurses hear problems immediately even when GPRS is down.

Pilot teams in Tanzania learned to mount probes in glycol buffer bottles mimicking vaccine thermal mass, reducing false alarms from door openings. Firmware sends hourly packets by default, conserving airtime on shared LoRaWAN networks.

Maintenance training is non-negotiable. Clinic aides practise battery swaps and OLED threshold checks quarterly. Kits include laminated Kiswahili quick-reference cards.

Open-source firmware and published BOMs let ministries audit security before scale-up—a requirement increasingly written into East African health ICT tenders.`,
      category: "IoT",
      publishedAt: new Date("2026-04-18"),
    },
  ];

  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        ...post,
        status: "PUBLISHED",
        authorId: instructorId ?? adminId,
      },
      create: {
        ...post,
        status: "PUBLISHED",
        authorId: instructorId ?? adminId,
      },
    });
    console.log(`  ✓ Blog: ${post.title}`);
  }

  // ─── Pricing plans (3) ────────────────────────────────────────────────────
  const pricingPlans = [
    {
      slug: "learner-free",
      name: "Learner Free",
      price: 0,
      period: null,
      features: [
        "Access all free published courses",
        "Community discussions",
        "Basic certificates on free courses",
        "Solutions workspace browse",
      ],
      sortOrder: 0,
      ctaLabel: "Create free account",
      ctaHref: "/auth/register",
    },
    {
      slug: "learner-pro",
      name: "Learner Pro",
      price: 29000,
      period: "month",
      features: [
        "All free tier benefits",
        "20% discount on paid courses",
        "Priority instructor Q&A",
        "Downloadable lab worksheets",
        "Project showcase featuring",
      ],
      isPopular: true,
      sortOrder: 1,
      ctaLabel: "Start Pro trial",
      ctaHref: "/auth/register?plan=pro",
    },
    {
      slug: "organization",
      name: "Organization",
      price: 0,
      period: "custom",
      features: [
        "Org admin portal & kit inventory",
        "Bulk learner seats",
        "Private cohort courses",
        "Analytics and completion reports",
        "Dedicated onboarding",
      ],
      sortOrder: 2,
      ctaLabel: "Contact partnerships",
      ctaHref: "/contact",
    },
  ];

  for (const plan of pricingPlans) {
    await db.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ Pricing: ${plan.name}`);
  }

  // ─── Projects (3) ─────────────────────────────────────────────────────────
  if (studentId) {
    const projects = [
      {
        slug: "nairobi-soil-moisture-network",
        title: "Nairobi School Garden Moisture Network",
        description:
          "ESP32 nodes with capacitive probes across a peri-urban school farm, logging to offline SD and syncing at the library hotspot. SMS summaries for the agriculture teacher in English and Kiswahili.",
        thumbnailUrl: "/content/projects/project-soil-network.jpg",
        category: "IoT",
        tags: ["ESP32", "Agriculture", "Nairobi"],
        status: "MVP" as const,
        githubUrl: "https://github.com/ujuzilab-demo/nairobi-soil-network",
        likesCount: 47,
      },
      {
        slug: "kigali-clinic-queue-app",
        title: "Kigali Clinic Queue Tracker",
        description:
          "Flutter app prototype for community health centre waiting lists with offline token numbers and nurse dashboard sync.",
        thumbnailUrl: "/content/projects/project-clinic-queue.jpg",
        category: "Mobile",
        tags: ["Flutter", "Healthcare", "Kigali"],
        status: "PROTOTYPE" as const,
        likesCount: 31,
      },
      {
        slug: "dar-solar-fridge-monitor",
        title: "Dar es Salaam Solar Fridge Monitor",
        description:
          "LoRa temperature uplink for a dispensary vaccine fridge powered by a bench-tested solar microgrid configuration.",
        thumbnailUrl: "/content/projects/project-solar-fridge.jpg",
        category: "Energy",
        tags: ["LoRa", "Solar", "Health"],
        status: "PROTOTYPE" as const,
        githubUrl: "https://github.com/ujuzilab-demo/dar-fridge-monitor",
        likesCount: 38,
      },
    ];

    for (const p of projects) {
      await db.project.upsert({
        where: { slug: p.slug },
        update: { ...p, creatorId: studentId, isPublished: true },
        create: { ...p, creatorId: studentId, isPublished: true },
      });
      console.log(`  ✓ Project: ${p.title}`);
    }
  }

  // ─── Enroll student in 1 course ───────────────────────────────────────────
  const arduinoCourseId = courseIds["arduino-robotics-african-makers"];
  if (studentId && arduinoCourseId) {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId: studentId, courseId: arduinoCourseId } },
      update: { enrolledAt: new Date() },
      create: { userId: studentId, courseId: arduinoCourseId },
    });
    console.log("  ✓ Student enrolled in Arduino Robotics for African Makers");
  }

  // Solution join for student
  if (studentId) {
    const solution = await db.solution.findUnique({
      where: { slug: "smart-irrigation-soil-moisture" },
    });
    if (solution) {
      await db.solutionJoin.upsert({
        where: { userId_solutionId: { userId: studentId, solutionId: solution.id } },
        update: { labProgress: [0, 1] },
        create: {
          userId: studentId,
          solutionId: solution.id,
          labProgress: [0, 1],
        },
      });
      console.log("  ✓ Student joined Smart Irrigation solution workspace");
    }
  }

  // ─── Mentors (sample industry practitioners) ───────────────────────────────
  const mentors = [
    {
      slug: "amina-mwakyusa",
      displayName: "Eng. Amina Mwakyusa",
      userId: instructorId,
      title: "Robotics Engineer",
      company: "TTCL Innovation Lab",
      avatarUrl: "/content/avatars/mentor-amina-mwakyusa.jpg",
      bio: "Amina has built robotics labs in 12 secondary schools across Dar es Salaam and mentors teams for national science fairs. She specializes in Arduino, motor control, and documentation for African makers.",
      hook: "Built 12 school robotics labs in Dar",
      quote: "I went from breadboard blinks to regional fair champion in 8 months — your path can be just as fast.",
      city: "Dar es Salaam",
      country: "Tanzania",
      expertiseTags: ["Arduino", "Motor control", "Science fairs", "Lab setup"],
      tracks: ["Robotics", "School Programs"],
      languages: ["English", "Swahili"],
      yearsExperience: 8,
      learningPath: [
        { title: "Arduino Robotics for African Makers", href: "/courses/arduino-robotics-african-makers", note: "Start here for foundations" },
        { title: "Arduino STEM Classroom Kit", href: "/kits/arduino-stem-classroom-kit", note: "Hardware for capstone builds" },
      ],
      recommendedCourseIds: arduinoCourseId ? [arduinoCourseId] : [],
      recommendedKitSlugs: ["arduino-stem-classroom-kit"],
      officeHoursNote: "Drop in for robot troubleshooting and fair prep.",
      isFeatured: true,
      isAcceptingRequests: true,
      studentsHelped: 47,
      sortOrder: 1,
      status: "PUBLISHED" as const,
    },
    {
      slug: "james-okello",
      displayName: "James Okello",
      title: "IoT Solutions Architect",
      company: "Nairobi TechStar",
      avatarUrl: "/content/avatars/mentor-james-okello.jpg",
      bio: "James designs LoRa and GSM sensor networks for agriculture and health clinics in East Africa. He helps learners bridge from tutorials to deployable prototypes.",
      hook: "Deployed 40+ IoT nodes across Kenya",
      city: "Nairobi",
      country: "Kenya",
      expertiseTags: ["LoRa", "GSM", "Sensor networks", "Agriculture"],
      tracks: ["IoT", "Data Science"],
      languages: ["English", "Swahili"],
      yearsExperience: 6,
      learningPath: [
        { title: "Smart Irrigation Solution", href: "/solutions/smart-irrigation-soil-moisture", note: "Hands-on IoT project path" },
      ],
      recommendedCourseIds: [],
      recommendedKitSlugs: [],
      isFeatured: true,
      isAcceptingRequests: true,
      studentsHelped: 31,
      sortOrder: 2,
      status: "PUBLISHED" as const,
    },
    {
      slug: "grace-mukamana",
      displayName: "Dr. Grace Mukamana",
      title: "STEM Educator & Career Coach",
      company: "Kigali STEM Academy",
      avatarUrl: "/content/avatars/mentor-grace-mukamana.jpg",
      bio: "Grace guides students and early-career innovators on learning paths, portfolio building, and competition strategy across East Africa.",
      hook: "Coached 200+ students into STEM careers",
      quote: "The right learning path beats random tutorials every time.",
      city: "Kigali",
      country: "Rwanda",
      expertiseTags: ["Career planning", "Competitions", "Portfolio", "Women in STEM"],
      tracks: ["Career Guidance", "Women in STEM", "Entrepreneurship"],
      languages: ["English", "French"],
      yearsExperience: 12,
      learningPath: [],
      recommendedCourseIds: [],
      recommendedKitSlugs: [],
      isFeatured: false,
      isAcceptingRequests: true,
      studentsHelped: 89,
      sortOrder: 3,
      status: "PUBLISHED" as const,
    },
  ];

  for (const m of mentors) {
    const { recommendedCourseIds, recommendedKitSlugs, learningPath, expertiseTags, tracks, languages, ...rest } = m;
    const created = await db.mentorProfile.upsert({
      where: { slug: m.slug },
      update: {
        ...rest,
        expertiseTags,
        tracks,
        languages,
        learningPath,
        recommendedCourseIds,
        recommendedKitSlugs,
      },
      create: {
        ...rest,
        expertiseTags,
        tracks,
        languages,
        learningPath,
        recommendedCourseIds,
        recommendedKitSlugs,
      },
    });

    if (m.slug === "amina-mwakyusa") {
      const existing = await db.mentorOfficeHour.findFirst({
        where: { mentorId: created.id, title: "Robotics office hours" },
      });
      if (!existing) {
        await db.mentorOfficeHour.create({
          data: {
            mentorId: created.id,
            title: "Robotics office hours",
            dayOfWeek: 2,
            startTime: "14:00",
            endTime: "16:00",
            timezone: "Africa/Dar_es_Salaam",
            isActive: true,
          },
        });
      }
      const groupAt = new Date();
      groupAt.setDate(groupAt.getDate() + 14);
      groupAt.setHours(15, 0, 0, 0);
      const existingGroup = await db.mentorGroupSession.findFirst({
        where: { mentorId: created.id, title: "Line-follower robot Q&A" },
      });
      if (!existingGroup) {
        await db.mentorGroupSession.create({
          data: {
            mentorId: created.id,
            title: "Line-follower robot Q&A",
            description: "Open group session for students building line-follower projects.",
            scheduledAt: groupAt,
            durationMins: 60,
            maxAttendees: 25,
            channelSlug: "mentorship",
            isActive: true,
          },
        });
      }
    }

    console.log(`  ✓ Mentor: ${m.displayName}`);
  }

  // Mentorship community thread
  if (studentId) {
    const existing = await db.discussion.findFirst({
      where: { channel: "mentorship", title: "Welcome to #mentorship — ask practitioners anything" },
    });
    if (!existing) {
      await db.discussion.create({
        data: {
          title: "Welcome to #mentorship — ask practitioners anything",
          body: "Introduce yourself and share what you're building. Mentors and peers can point you to courses, kits, and projects on UjuziLab.",
          channel: "mentorship",
          authorId: adminId ?? studentId,
          courseId: null,
        },
      });
    }
    console.log("  ✓ Mentorship community thread");
  }
}
