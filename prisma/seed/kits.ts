import { PrismaClient } from "@prisma/client";

export type KitIdMap = Record<string, string>;

export async function seedKits(db: PrismaClient): Promise<KitIdMap> {
  const kitIds: KitIdMap = {};

  const kits = [
    {
      slug: "arduino-stem-classroom-kit",
      title: "Arduino STEM Classroom Kit",
      subtitle: "30-student robotics lab bundle for African schools",
      description:
        "A complete classroom kit designed for TechStar UjuziLab partner schools. Includes Arduino Uno boards, sensors, motor drivers, and bilingual educator guides aligned with national STEM curricula in East Africa. Supports line-following robots, environmental monitoring, and introductory IoT projects.",
      thumbnailUrl: "/content/kits/kit-arduino-classroom.jpg",
      category: "Robotics",
      difficulty: "BEGINNER" as const,
      ageRange: "12–18",
      price: 185000,
      inventoryCount: 120,
      learningOutcomes: [
        "Assemble safe breadboard circuits with correct current limiting",
        "Program digital I/O and read analogue sensors",
        "Build a differential-drive robot chassis",
        "Document prototypes for school science fairs",
      ],
      projectIdeas: [
        "Automated classroom ventilation monitor",
        "Solar-tracked phone charging station",
        "Line-following competition robot",
      ],
      relatedCourseSlugs: ["arduino-robotics-african-makers"],
      components: [
        { name: "Arduino Uno R3 (compatible)", quantity: 15, imageUrl: "/content/components/component-arduino-uno.jpg", description: "Main microcontroller board with USB programming.", orderIndex: 0 },
        { name: "Half-size breadboard", quantity: 15, imageUrl: "/content/components/component-breadboard.jpg", description: "400-tie solderless breadboard.", orderIndex: 1 },
        { name: "L298N motor driver", quantity: 10, imageUrl: "/content/components/component-motor-driver.jpg", description: "Dual H-bridge for DC gear motors.", orderIndex: 2 },
        { name: "IR line sensor module", quantity: 20, imageUrl: "/content/components/component-ir-sensor.jpg", description: "Reflective sensor for robotics tracks.", orderIndex: 3 },
        { name: "DHT22 temperature-humidity", quantity: 10, imageUrl: "/content/components/component-dht22.jpg", description: "Digital environmental sensor.", orderIndex: 4 },
        { name: "Jumper wire kit", quantity: 15, imageUrl: "/content/components/component-jumper-wires.jpg", description: "Male-male dupont wires assorted lengths.", orderIndex: 5 },
        { name: "USB power bank 10000mAh", quantity: 5, imageUrl: "/content/components/component-power-bank.jpg", description: "Lab power during load-shedding.", orderIndex: 6 },
      ],
      materials: [
        { title: "UjuziLab Arduino Educator Guide (English & Kiswahili)", type: "GUIDE" as const, url: "/content/kits/materials/arduino-educator-guide.pdf", orderIndex: 0 },
        { title: "Classroom Safety & ESD Checklist", type: "PDF" as const, url: "/content/kits/materials/classroom-safety.pdf", orderIndex: 1 },
        { title: "Line-Follower Build Worksheet", type: "WORKSHEET" as const, url: "/content/kits/materials/line-follower-worksheet.pdf", orderIndex: 2 },
        { title: "Robot Competition Scoring Rubric", type: "PDF" as const, url: "/content/kits/materials/competition-rubric.pdf", orderIndex: 3 },
      ],
      gallery: [
        { url: "/content/kits/kit-arduino-classroom.jpg", caption: "Full classroom kit layout", isPrimary: true, orderIndex: 0 },
        { url: "/content/kits/gallery/arduino-kit-students.jpg", caption: "Students at DIT robotics lab", orderIndex: 1 },
        { url: "/content/kits/gallery/arduino-kit-robot.jpg", caption: "Sample line-following robot", orderIndex: 2 },
      ],
    },
    {
      slug: "esp32-iot-field-kit",
      title: "ESP32 IoT Field Kit",
      subtitle: "Rugged sensing node bundle for farms and clinics",
      description:
        "Field-ready ESP32 nodes with soil moisture, DHT22, LoRa module, and weatherproof enclosure templates. Built for UjuziLab smart agriculture and rural connectivity courses. Supports offline SD logging and LoRaWAN gateway integration.",
      thumbnailUrl: "/content/kits/kit-esp32-iot-field.jpg",
      category: "IoT",
      difficulty: "INTERMEDIATE" as const,
      ageRange: "16+",
      price: 245000,
      inventoryCount: 80,
      learningOutcomes: [
        "Configure ESP32 deep-sleep power profiles",
        "Deploy capacitive soil moisture sensing",
        "Establish LoRa point-to-point links",
        "Design maintainable rural enclosures",
      ],
      projectIdeas: [
        "School garden irrigation controller",
        "Vaccine fridge temperature uplink",
        "Borehole level monitor",
      ],
      relatedCourseSlugs: ["iot-smart-agriculture-east-africa", "esp32-lora-rural-connectivity"],
      components: [
        { name: "ESP32-WROOM-32 dev board", quantity: 5, imageUrl: "/content/components/component-esp32.jpg", description: "Wi-Fi/BLE microcontroller with USB-C.", orderIndex: 0 },
        { name: "SX1276 LoRa module 868MHz", quantity: 5, imageUrl: "/content/components/component-lora.jpg", description: "Long-range sub-GHz radio.", orderIndex: 1 },
        { name: "Capacitive soil moisture v1.2", quantity: 10, imageUrl: "/content/components/component-soil-sensor.jpg", description: "Corrosion-resistant agriculture probe.", orderIndex: 2 },
        { name: "IP65 enclosure template", quantity: 5, imageUrl: "/content/components/component-enclosure.jpg", description: "3D-printable field node housing.", orderIndex: 3 },
        { name: "18650 battery holder + cells", quantity: 5, imageUrl: "/content/components/component-battery.jpg", description: "Rechargeable field power.", orderIndex: 4 },
      ],
      materials: [
        { title: "ESP32 Field Deployment Manual", type: "GUIDE" as const, url: "/content/kits/materials/esp32-field-manual.pdf", orderIndex: 0 },
        { title: "LoRa Link Budget Calculator Worksheet", type: "WORKSHEET" as const, url: "/content/kits/materials/lora-link-budget.pdf", orderIndex: 1 },
        { title: "Firmware Flashing Quick Start", type: "PDF" as const, url: "/content/kits/materials/esp32-flash-guide.pdf", orderIndex: 2 },
      ],
      gallery: [
        { url: "/content/kits/kit-esp32-iot-field.jpg", caption: "ESP32 field kit components", isPrimary: true, orderIndex: 0 },
        { url: "/content/kits/gallery/esp32-field-node.jpg", caption: "Deployed node at demo farm", orderIndex: 1 },
      ],
    },
    {
      slug: "solar-learning-lab-kit",
      title: "Solar Learning Lab Kit",
      subtitle: "Bench-scale PV training for health centre microgrids",
      description:
        "Educational solar training bundle with 50W panel, MPPT charge controller, LiFePO4 battery, loads, and measurement tools. Aligns with UjuziLab solar microgrid curriculum for technicians supporting rural health facilities.",
      thumbnailUrl: "/content/kits/kit-solar-learning.jpg",
      category: "Energy",
      difficulty: "INTERMEDIATE" as const,
      ageRange: "16+",
      price: 320000,
      inventoryCount: 45,
      learningOutcomes: [
        "Size PV arrays for clinic load profiles",
        "Wire MPPT controllers safely",
        "Interpret irradiance and yield data",
        "Produce maintenance checklists for staff",
      ],
      projectIdeas: [
        "Maternity ward LED lighting upgrade",
        "Vaccine fridge backup supply study",
        "School phone-charging kiosk",
      ],
      relatedCourseSlugs: ["solar-microgrids-health-centres"],
      components: [
        { name: "50W monocrystalline panel", quantity: 1, imageUrl: "/content/components/component-solar-panel.jpg", description: "Bench-mount demonstration panel.", orderIndex: 0 },
        { name: "20A MPPT charge controller", quantity: 1, imageUrl: "/content/components/component-mppt.jpg", description: "12V system with USB diagnostics.", orderIndex: 1 },
        { name: "12.8V 20Ah LiFePO4 battery", quantity: 1, imageUrl: "/content/components/component-lifepo4.jpg", description: "Safe chemistry for clinic training.", orderIndex: 2 },
        { name: "DC load bank + meters", quantity: 1, imageUrl: "/content/components/component-load-bank.jpg", description: "Variable resistive test loads.", orderIndex: 3 },
      ],
      materials: [
        { title: "Solar Microgrid Educator Guide", type: "GUIDE" as const, url: "/content/kits/materials/solar-educator-guide.pdf", orderIndex: 0 },
        { title: "Clinic Load Survey Template", type: "WORKSHEET" as const, url: "/content/kits/materials/clinic-load-survey.pdf", orderIndex: 1 },
        { title: "Maintenance Schedule PDF", type: "PDF" as const, url: "/content/kits/materials/solar-maintenance.pdf", orderIndex: 2 },
      ],
      gallery: [
        { url: "/content/kits/kit-solar-learning.jpg", caption: "Solar learning lab bench kit", isPrimary: true, orderIndex: 0 },
        { url: "/content/kits/gallery/solar-clinic-demo.jpg", caption: "Clinic microgrid demonstration", orderIndex: 1 },
      ],
    },
  ];

  for (const kit of kits) {
    const { components, materials, gallery, ...data } = kit;
    const created = await db.kit.upsert({
      where: { slug: kit.slug },
      update: {
        ...data,
        isFree: false,
        status: "PUBLISHED",
        learningOutcomes: data.learningOutcomes,
        projectIdeas: data.projectIdeas,
        relatedCourseSlugs: data.relatedCourseSlugs,
      },
      create: {
        ...data,
        isFree: false,
        status: "PUBLISHED",
        learningOutcomes: data.learningOutcomes,
        projectIdeas: data.projectIdeas,
        relatedCourseSlugs: data.relatedCourseSlugs,
        components: { create: components },
        materials: { create: materials },
        gallery: { create: gallery },
      },
    });
    kitIds[kit.slug] = created.id;
    console.log(`  ✓ Kit: ${kit.title}`);
  }

  return kitIds;
}
