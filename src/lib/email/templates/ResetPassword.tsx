import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function ResetPassword({ name, url }: { name: string; url: string }) {
  return (
    <Layout preview="Reset hasła do konta Ogrody Kryscar">
      <Heading as="h2">Reset hasła</Heading>
      <Text style={p}>
        Cześć{name ? `, ${name}` : ""}. Otrzymaliśmy prośbę o reset hasła do Twojego
        konta. Kliknij przycisk poniżej, aby ustawić nowe hasło. Link jest ważny
        przez ograniczony czas.
      </Text>
      <Button href={url} style={btn}>Ustaw nowe hasło</Button>
      <Text style={p}>Jeśli to nie Ty prosiłeś o reset, zignoruj tę wiadomość.</Text>
    </Layout>
  );
}
