import { prisma } from "./prisma";
import { saveKnowledgeEntries } from "./knowledge";

// Initial knowledge base data
const initialKnowledge = [
  {
    category: "About",
    question: "What is Kenmark ITan Solutions?",
    answer: "Kenmark ITan Solutions is a leading technology company specializing in innovative IT solutions, AI integration, and digital transformation services. We help businesses leverage cutting-edge technology to achieve their goals.",
    source: "website",
  },
  {
    category: "Services",
    question: "What services are offered?",
    answer: "We offer a wide range of services including: IT consulting, AI solutions development, digital transformation, cloud services, software development, and technology training programs.",
    source: "website",
  },
  {
    category: "Contact",
    question: "How can I contact the company?",
    answer: "You can contact us through our website at kenmarkitan.com, visit our contact page, or reach out via email for inquiries.",
    source: "website",
  },
];

export async function seedInitialKnowledge() {
  try {
    const count = await prisma.knowledgeBase.count();
    
    if (count === 0) {
      console.log("Seeding initial knowledge base...");
      await saveKnowledgeEntries(initialKnowledge);
      console.log("✅ Initial knowledge base seeded successfully!");
    } else {
      console.log("Knowledge base already has entries. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding knowledge base:", error);
  }
}

