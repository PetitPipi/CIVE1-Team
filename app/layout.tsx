import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Geotechnical Assistant",
  description: "A geotechnical assistant based on quickstart template using the Assistants API with OpenAI.",
  icons: {
    icon: "/openai.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  return (
    <html lang="en">
      <body>
        {hasApiKey ? children : <Warnings />}
      </body>
    </html>
  );
}

