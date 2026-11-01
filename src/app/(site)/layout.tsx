"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import { display } from "../fonts";
import DiwaliDefs from "@/components/Diwali/Defs";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { SessionProvider } from "next-auth/react";
import StoreSync from "@/components/Common/StoreSync";
import { Toaster } from "react-hot-toast";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en" className={display.variable} suppressHydrationWarning={true}>
      <body>
        <DiwaliDefs />
        {loading ? (
          <PreLoader />
        ) : (
          <>
            <SessionProvider>
            <ReduxProvider>
              <StoreSync />
              <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
              <CartModalProvider>
                <ModalProvider>
                  <PreviewSliderProvider>
                    <Header />
                    {children}

                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                  </PreviewSliderProvider>
                </ModalProvider>
              </CartModalProvider>
            </ReduxProvider>
            <ScrollToTop />
            <Footer />
            </SessionProvider>
          </>
        )}
      </body>
    </html>
  );
}
