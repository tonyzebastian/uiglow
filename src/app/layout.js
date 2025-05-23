import { Bitter, Raleway } from "next/font/google";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  // Typically for headings you might only need a few weights
  weight: ["500", "600", "700"],
  display: 'swap',
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  // Full range of weights for body text
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata = {
  title: "UiGlow",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bitter.variable} ${raleway.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
