import type { Metadata } from "next";
import Builder from "./Builder";

export const metadata: Metadata = {
  title: "Dashboard — Cardboard Mania",
};

export default function DashboardPage() {
  return <Builder />;
}
