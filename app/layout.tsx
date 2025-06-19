import type { Metadata } from "next";
import "./globals.css";
import "./prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Deepseek By Nyigana",
  description: "Ask and you shall be answered...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <body className={`antialiased`}>
            <Toaster toastOptions={
              {
                success:{style:{background:"black",color:"white"}},
                  error:{style:{background:"black",color:"white"}}
                }
              }/>
            {children}</body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
