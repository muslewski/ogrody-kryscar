import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function NewRequestTeam(props: {
  customerName: string;
  lawnName: string;
  address: string;
  serviceTitles: string[];
  note: string | null;
  estRange: string;
  url: string;
}) {
  return (
    <Layout preview={`Nowe zlecenie: ${props.lawnName}`}>
      <Heading as="h2">Nowe zlecenie</Heading>
      <Text style={p}>
        <strong>{props.customerName}</strong> złożył(a) nowe zlecenie dla ogrodu{" "}
        <strong>{props.lawnName}</strong>
        {props.address ? ` (${props.address})` : ""}.
      </Text>
      <Text style={p}>
        Usługi: {props.serviceTitles.join(", ") || "—"}<br />
        Szacunkowa wycena: {props.estRange}
        {props.note ? <><br />{"Uwagi: „"}{props.note}{"”"}</> : null}
      </Text>
      <Button href={props.url} style={btn}>Otwórz zlecenie</Button>
    </Layout>
  );
}
