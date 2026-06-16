import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function RequestDecision(props: {
  customerName: string;
  lawnName: string;
  decision: "accepted" | "declined";
  visitDate?: string;
  reason?: string;
  url: string;
}) {
  const accepted = props.decision === "accepted";
  return (
    <Layout preview={accepted ? "Twoje zlecenie zostało przyjęte" : "Twoje zlecenie zostało odrzucone"}>
      <Heading as="h2">{accepted ? "Zlecenie przyjęte" : "Zlecenie odrzucone"}</Heading>
      <Text style={p}>
        Cześć{props.customerName ? `, ${props.customerName}` : ""}. Twoje zlecenie dla
        ogrodu <strong>{props.lawnName}</strong>{" "}
        {accepted ? "zostało przyjęte." : "niestety zostało odrzucone."}
      </Text>
      {accepted && props.visitDate ? (
        <Text style={p}>Pierwsza wizyta zaplanowana na: <strong>{props.visitDate}</strong>.</Text>
      ) : null}
      {!accepted && props.reason ? (
        <Text style={p}>Powód: {props.reason}</Text>
      ) : null}
      <Button href={props.url} style={btn}>Zobacz swoje zamówienia</Button>
    </Layout>
  );
}
