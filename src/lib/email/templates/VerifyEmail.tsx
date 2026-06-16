import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function VerifyEmail({ name, url }: { name: string; url: string }) {
  return (
    <Layout preview="Potwierdź swój adres e-mail">
      <Heading as="h2">Witaj{name ? `, ${name}` : ""}!</Heading>
      <Text style={p}>
        Dziękujemy za założenie konta w Ogrodach Kryscar. Potwierdź swój adres
        e-mail, klikając przycisk poniżej.
      </Text>
      <Button href={url} style={btn}>Potwierdź adres e-mail</Button>
      <Text style={p}>Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</Text>
    </Layout>
  );
}
