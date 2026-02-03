import { ShareClient } from "./share-client";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export const dynamicParams = false;

export default function SharePage({ params }: { params: { id: string } }) {
  return <ShareClient shareId={params.id} />;
}
