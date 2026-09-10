import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata = {
  title: "Snapwritoo",
  description: "Poems, Pitch & Frames",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <div className="grain" />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}