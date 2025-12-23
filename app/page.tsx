import Chatbot from "@/components/Chatbot";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Kenmark ITan Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome to our AI-powered virtual assistant
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Admin Panel
            </Link>
            <a
              href="https://kenmarkitan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Visit Website
            </a>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            About Kenmark ITan Solutions
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Kenmark ITan Solutions is a leading technology company specializing
            in innovative IT solutions, AI integration, and digital transformation
            services. We help businesses leverage cutting-edge technology to
            achieve their goals.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Our AI chatbot is here to assist you with any questions about our
            services, company information, or general inquiries. Click the chat
            button in the bottom right corner to get started!
          </p>
        </div>
      </div>
      <Chatbot />
    </main>
  );
}

