import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function VisitScheduled(props: {
  customerName: string;
  lawnName: string;
  scheduledAt: string;
  url: string;
}) {
  return (
    <Layout preview={`Zaplanowano wizytę: ${props.lawnName}`}>
      <Heading as="h2">Zaplanowano kolejną wizytę</Heading>
      <Text style={p}>
        Cześć{props.customerName ? `, ${props.customerName}` : ""}. Zaplanowaliśmy
        wizytę w ogrodzie <strong>{props.lawnName}</strong> na:{" "}
        <strong>{props.scheduledAt}</strong>.
      </Text>
      <Button href={props.url} style={btn}>Szczegóły w panelu</Button>
    </Layout>
  );
}
