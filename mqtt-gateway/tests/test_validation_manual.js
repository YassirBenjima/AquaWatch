import { validateSensorData } from "../src/utils/validation.js";

const testCases = [
  {
    name: "Valid Payload",
    input: {
      station_id: "ST-001",
      timestamp: Date.now(),
      sensors: { ph: 7.2, temperature: 25.5, turbidity: 4.0, conductivity: 120 }
    },
    expected: true
  },
  {
    name: "Missing Station ID",
    input: {
      timestamp: Date.now(),
      sensors: { ph: 7.0 }
    },
    expected: false
  },
  {
    name: "Invalid pH (High)",
    input: {
      station_id: "ST-001",
      timestamp: Date.now(),
      sensors: { ph: 15.0 }
    },
    expected: false
  },
  {
    name: "Invalid pH (Type)",
    input: {
      station_id: "ST-001",
      timestamp: Date.now(),
      sensors: { ph: "neutral" }
    },
    expected: false
  },
  {
    name: "Missing Sensors Object",
    input: {
      station_id: "ST-001",
      timestamp: Date.now()
    },
    expected: false
  }
];

console.log("🧪 Running Validation Tests...");
let passed = 0;
testCases.forEach(test => {
  const result = validateSensorData(test.input);
  if (result === test.expected) {
    passed++;
    console.log(`✅ [PASS] ${test.name}`);
  } else {
    console.log(`❌ [FAIL] ${test.name} - Expected ${test.expected}, got ${result}`);
  }
});

console.log(`\nResults: ${passed}/${testCases.length} Passed`);
if (passed === testCases.length) process.exit(0);
else process.exit(1);
