import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = "AIzaSyDf53E_4RoyoPiYbYu_yvwId5rtb9OV54Q";
const genAI = new GoogleGenerativeAI(apiKey);

async function test(name) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    await model.generateContent("hi");
    console.log(`✅ ${name} works`);
    return true;
  } catch (e) {
    console.log(`❌ ${name} failed: ${e.message}`);
    return false;
  }
}

async function main() {
  await test("gemini-1.5-flash");
  await test("gemini-1.5-flash-latest");
  await test("gemini-2.5-flash");
}
main();
