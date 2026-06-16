import {
  Body, Container, Head, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const main = { backgroundColor: "#f6f7f6", fontFamily: "Arial, sans-serif" };
const container = {
  margin: "0 auto", padding: "24px", maxWidth: "560px",
  backgroundColor: "#ffffff", borderRadius: "12px",
};
const brand = { color: "#047857", fontSize: "18px", fontWeight: "bold" as const, margin: "0 0 16px" };
const footer = { color: "#9ca3af", fontSize: "12px", lineHeight: "18px" };

/** Shared shell: emerald wordmark header + address footer. `preview` is the inbox snippet. */
export function Layout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Ogrody Kryscar</Text>
          <Section>{children}</Section>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Text style={footer}>
            Ogrody Kryscar · ogrody@kryscar.pl<br />
            Ta wiadomość została wysłana automatycznie.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const btn = {
  display: "inline-block", backgroundColor: "#047857", color: "#ffffff",
  padding: "10px 18px", borderRadius: "8px", textDecoration: "none",
  fontWeight: "bold" as const, fontSize: "14px",
};
export const p = { color: "#374151", fontSize: "14px", lineHeight: "22px" };
