import "./globals.css";

export const metadata = {
  title: "Finprint — Modern Workforce Management",
  description: "Clarity for your workforce. Track performance, attendance, and growth all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
