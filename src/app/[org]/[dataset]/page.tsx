import { redirect } from "next/navigation";

import { loadEpisodeIndices } from "@/app/[org]/[dataset]/[episode]/fetch-data";
import { getDatasetVersionAndInfo } from "@/utils/versionUtils";

export default async function DatasetRootPage({
  params,
}: {
  params: Promise<{ org: string; dataset: string }>;
}) {
  const { org, dataset: rawDataset } = await params;
  const dataset = decodeURIComponent(rawDataset);

  const envEpisode = process.env.EPISODES?.split(/\s+/)
    .map((x) => parseInt(x.trim(), 10))
    .filter((x) => !isNaN(x))[0];

  // Land on an episode the dataset actually has. Defaulting to 0 breaks any
  // dataset whose ids are not 0-based: a split written with
  // `episode_indices_renumbered: false` keeps its parent's numbering, so its
  // first episode can be 27. See loadEpisodeIndices.
  let episodeN = envEpisode;
  if (episodeN === undefined) {
    try {
      const repoId = `${org}/${dataset}`;
      const { version } = await getDatasetVersionAndInfo(repoId);
      episodeN = (await loadEpisodeIndices(repoId, version))[0];
    } catch {
      // Leave undefined; the fallback below keeps the previous behaviour and the
      // episode page reports a missing id more clearly than this redirect can.
    }
  }

  redirect(`/${org}/${encodeURIComponent(dataset)}/episode_${episodeN ?? 0}`);
}
