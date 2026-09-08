/**
 * Copies generated images from Cursor assets into public/content/.
 * Usage: node scripts/install-content-images.mjs [assetsDir]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultAssets =
  process.env.CONTENT_ASSETS_DIR ||
  "C:\\Users\\IMC\\.cursor\\projects\\c-Users-IMC-Documents-ujuzi\\assets";
const assetsDir = process.argv[2] || defaultAssets;
const root = path.join(__dirname, "..", "public", "content");

const map = {
  "course-arduino-robotics.jpg": "courses/course-arduino-robotics.jpg",
  "course-flutter-mobile.jpg": "courses/course-flutter-mobile.jpg",
  "course-iot-farming.jpg": "courses/course-iot-farming.jpg",
  "course-python-data.jpg": "courses/course-python-data.jpg",
  "course-esp32-lora.jpg": "courses/course-esp32-lora.jpg",
  "course-solar-health.jpg": "courses/course-solar-health.jpg",
  "course-pcb-kicad.jpg": "courses/course-pcb-kicad.jpg",
  "kit-arduino-classroom.jpg": "kits/kit-arduino-classroom.jpg",
  "kit-esp32-iot-field.jpg": "kits/kit-esp32-iot-field.jpg",
  "kit-solar-learning.jpg": "kits/kit-solar-learning.jpg",
  "arduino-kit-students.jpg": "kits/gallery/arduino-kit-students.jpg",
  "arduino-kit-robot.jpg": "kits/gallery/arduino-kit-robot.jpg",
  "esp32-field-node.jpg": "kits/gallery/esp32-field-node.jpg",
  "solar-clinic-demo.jpg": "kits/gallery/solar-clinic-demo.jpg",
  "org-dit-tanzania.png": "orgs/org-dit-tanzania.png",
  "org-makerere-hub.png": "orgs/org-makerere-hub.png",
  "org-kigali-stem.png": "orgs/org-kigali-stem.png",
  "org-nairobi-techstar.png": "orgs/org-nairobi-techstar.png",
  "project-soil-network.jpg": "projects/project-soil-network.jpg",
  "project-clinic-queue.jpg": "projects/project-clinic-queue.jpg",
  "project-solar-fridge.jpg": "projects/project-solar-fridge.jpg",
  "project-solar-irrigation.jpg": "projects/project-solar-irrigation.jpg",
  "project-health-chatbot.jpg": "projects/project-health-chatbot.jpg",
  "project-air-quality.jpg": "projects/project-air-quality.jpg",
  "component-arduino-uno.jpg": "components/component-arduino-uno.jpg",
  "component-esp32.jpg": "components/component-esp32.jpg",
  "component-dht22.jpg": "components/component-dht22.jpg",
  "component-soil-sensor.jpg": "components/component-soil-sensor.jpg",
  "component-lora.jpg": "components/component-lora.jpg",
  "component-breadboard.jpg": "components/component-breadboard.jpg",
  "component-motor-driver.jpg": "components/component-motor-driver.jpg",
  "component-ir-sensor.jpg": "components/component-ir-sensor.jpg",
  "component-jumper-wires.jpg": "components/component-jumper-wires.jpg",
  "component-power-bank.jpg": "components/component-power-bank.jpg",
  "component-enclosure.jpg": "components/component-enclosure.jpg",
  "component-battery.jpg": "components/component-battery.jpg",
  "component-solar-panel.jpg": "components/component-solar-panel.jpg",
  "component-mppt.jpg": "components/component-mppt.jpg",
  "component-lifepo4.jpg": "components/component-lifepo4.jpg",
  "component-load-bank.jpg": "components/component-load-bank.jpg",
  "certificate-template.jpg": "certificates/certificate-template.jpg",
};

let copied = 0;
let missing = [];

for (const [name, rel] of Object.entries(map)) {
  const src = path.join(assetsDir, name);
  const dest = path.join(root, rel);
  if (!fs.existsSync(src)) {
    missing.push(name);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const size = fs.statSync(dest).size;
  console.log(`OK ${rel} (${Math.round(size / 1024)} KB)`);
  copied++;
}

console.log(`\nInstalled ${copied}/${Object.keys(map).length} images.`);
if (missing.length) {
  console.log("Missing (use placeholders):", missing.join(", "));
}
