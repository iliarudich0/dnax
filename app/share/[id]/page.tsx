import ShareClient from "./share-client";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "mock-id" }, { id: "nebula" }];
}

type SharePageProps = {
  params: { id: string };
};

export default function SharePage({ params }: SharePageProps) {
  return <ShareClient id={params.id} />;
}
